import type { OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import EventEmitter from 'events';
import util from 'util';

import type { ETaskType } from '~common/enums';
import { EPlatformSocketEventType, ETaskStatus } from '~common/enums';
import type { TNewTaskDescription, TTaskResponsePayloadType } from '~common/types/TNewTaskDescription';
import { ApiClientService } from '~core/api-client';
import { LogService } from '~core/log';
import { SocketClientService } from '~core/socket';

import type { ITask, ITaskOptions, TTaskFunction } from './task.interfaces';
import { TaskRegistry } from './task.registry';

const enum ETaskServiceEvent {
  RUN_QUEUE = 'RUN_QUEUE',
}
@Injectable()
export class TaskService<T extends string, K extends TTaskFunction> implements OnModuleInit {
  private activeTasks = new Set<string>();
  private taskEmitter = new EventEmitter();

  private queues = new Map<T, {
    task: {
      instance: ITask<K>,
      options: ITaskOptions,
    },
    isRunning: boolean,
    items: Array<{taskId: string, payload: K}>,
  }>();

  constructor(
    private readonly apiClientService: ApiClientService,
    private readonly logger: LogService,
    private readonly registry: TaskRegistry<T, K>,
    private readonly socketClientService: SocketClientService,
  ) {
    logger.setContext(this.constructor.name);
  }

  public onModuleInit() {
    this.socketClientService.subscribePlatformEvent(EPlatformSocketEventType.NEW_TASK, async (taskDescription) => {
      await this.processIncomingTask(taskDescription);
    });
    this.taskEmitter.on(ETaskServiceEvent.RUN_QUEUE, async (type: T) => {
      await this.startQueue(type);
    });
    this.logger.info('Initialized');
  }

  public registerTask(name: T, options: ITaskOptions, instance: ITask<K>) {
    this.registry.setTask(name, instance, options);
    if (options.queue) {
      this.createQueue(name, { instance, options });
    }
  }

  private createQueue(name: T, task: {instance: ITask<K>, options: ITaskOptions}) {
    this.queues.set(name, {
      task,
      isRunning: false,
      items: [],
    });
  }

  private queueTask(type: T, taskId: string, payload: K) {
    const queue = this.getQueue(type);
    queue.items.push({ taskId, payload });
    this.logger.debug(`New item added to queue "${type}": ${this.logger.prepareData(payload)}`);
    this.logger.debug(`Total items in "${type}" queue: ${queue.items.length}`);
    this.taskEmitter.emit(ETaskServiceEvent.RUN_QUEUE, type);
  }

  private getQueue(type: T) {
    const queue = this.queues.get(type);
    if (!queue) {
      throw new Error(`No queue for task "${type}" found`);
    }

    return queue;
  }

  private async processIncomingTask(taskDescription: TNewTaskDescription<T, K>) {
    const { taskId, payload, type } = taskDescription;
    this.logger.debug(`Task id ${taskId} was received: type ${type} payload ${this.logger.prepareData(payload)}`);
    if (!this.registry.hasTask(type)) {
      await this.updateTaskError(taskId, type, `No task processor with type ${type} is available`);

      return;
    }

    if (this.activeTasks.has(taskId)) {
      this.logger.debug(`Task id ${taskId}, type ${type} is already in progress`);

      return;
    } else {
      this.activeTasks.add(taskId);
    }

    const task = this.registry.getTask(type);
    try {
      await this.apiClientService.updateTaskStatus(taskId, ETaskStatus.CONFIRMED, type as ETaskType);
      this.logger.debug(`Task id ${taskId} was confirmed: type ${type}, payload ${this.logger.prepareData(payload)}`);
      if (task!.options.queue) {
        this.queueTask(type, taskId, payload);
      } else {
        await this.processTask(task!, type, taskId, payload);
      }
    } catch (error) {
      this.logErrorMessage(error);
      this.activeTasks.delete(taskId);
    }
  }

  private async startQueue(type: T) {
    const queue = this.getQueue(type);
    if (queue.isRunning) {
      return;
    }

    queue.isRunning = true;

    this.logger.debug(`"${type}" queue is started`);
    while (queue.items.length) {
      const item = queue.items.shift();

      if (item) {
        await this.processTask(queue.task, type, item.taskId, item.payload);
      }
    }
    queue.isRunning = false;
  }

  private async processTask(task: {instance: ITask<K>, options: ITaskOptions}, type: T, taskId: string, payload: K) {
    let result: ReturnType<K> | undefined;
    try {
      result = await task.instance.run(taskId, payload);
      await this.updateTaskSuccess(type, taskId, result as unknown as TTaskResponsePayloadType<T>);
    } catch (error) {
      await this.updateTaskError(taskId, type, this.getErrorDetails(error));
    } finally {
      this.activeTasks.delete(taskId);
    }
  }

  private async updateTaskSuccess(type: T, taskId: string, payload: TTaskResponsePayloadType<T>) {
    try {
      await this.apiClientService.updateTaskStatus(taskId, ETaskStatus.SUCCESS, type as ETaskType, payload);
      this.logger.debug(`Task id ${taskId} was updated with status ${ETaskStatus.SUCCESS}: type ${type} payload ${util.inspect(payload)}`);
    } catch (error) {
      this.logErrorMessage(error);
    }
  }

  private async updateTaskError(taskId: string, type: T, errorMessage: string) {
    this.logger.error(`Task id ${taskId} was failed: type ${type} error: ${errorMessage}`);

    try {
      await this.apiClientService.updateTaskStatus(taskId, ETaskStatus.ERROR, type as ETaskType, errorMessage);
    } catch (error) {
      this.logErrorMessage(error);
    }
  }

  private logErrorMessage(error: unknown) {
    let message = `Error updating task status: `;
    message += this.getErrorDetails(error);

    this.logger.error(message);
  }

  private getErrorDetails(error: unknown) {
    let details = '';
    if (error instanceof Error) {
      details += `${error.message}. Error stack ${error.stack}`;
    } else {
      details += util.inspect(error);
    }

    return details;
  }
}
