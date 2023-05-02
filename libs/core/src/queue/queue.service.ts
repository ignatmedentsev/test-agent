import { HttpService } from '@nestjs/axios';
import type { OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { lastValueFrom } from 'rxjs';
import type { FindOptionsWhere } from 'typeorm';
import { In, Not } from 'typeorm';

import type { EQueueType } from '~common/enums';
import { EAgentApiUrl } from '~common/enums'; // TODO: get rid of dependency
import { delay } from '~common/utils/delay';
import { CoreConfigService } from '~core/services';

import { NonTxDbService } from '../db';
import { LogService } from '../log';

import { DEFAULT_QUEUE_OPTIONS } from './queue.constants';
import type { QueueOptions } from './queue.decorator';
import { Queue } from './queue.entity';
import { EQueuePriority, EQueueStatus } from './queue.enums';
import type { QueueInterface } from './queue.interface';
import { QueueRegistry } from './queue.registry';
import { QueueRepository } from './queue.repository';
import { QueueRunner } from './queue.runner';

const QUEUE_PORTION_MAX_SIZE = 1;

enum EQueueEvent {
  RUN_QUEUE = 'run-queue',
}

// TODO: add expired time for delayed tasks
// TODO: graceful stop for queues on application end
@Injectable()
export class QueueService implements OnModuleInit {
  private queueItemProcessEndpoint: string;

  private currentThreadNumbers = new Map<string, number>();
  private queueEmitter = new EventEmitter();

  constructor(
    private readonly nonTxDb: NonTxDbService,
    private readonly http: HttpService,
    private readonly logger: LogService,
    private readonly registry: QueueRegistry,
    private readonly queueRunner: QueueRunner,
    private readonly queueRepository: QueueRepository,
    private readonly configService: CoreConfigService,
  ) {
    this.subscribeEvents();
    logger.setContext(this.constructor.name);
    this.queueItemProcessEndpoint = `http://localhost:${this.configService.getHttpPort()}${EAgentApiUrl.SYS_QUEUE_ITEM_PROCESS}`;
  }

  public onModuleInit() {
    this.subscribeEvents();
    this.logger.info('Initialized');
  }

  public setParallelThreadsNumbers(parallelThreadsNumbers: Map<string, number>) {
    this.registry.setParallelThreadsNumbers(parallelThreadsNumbers);
  }

  public setParallelThreadsNumber(type: string, parallelThreadsNumber: number) {
    if (this.registry.getParallelThreadsNumber(type) === parallelThreadsNumber) {
      return;
    }

    this.registry.setParallelThreadsNumber(type, parallelThreadsNumber);

    this.logger.info(`Parallel threads number for task ${type} was changed to ${parallelThreadsNumber}`);
  }

  public getAvailableActions() {
    const queueNames = Array.from(this.registry.getTaskNames());

    const result: Record<string, { deleteAvailable: boolean, restartAvailable: boolean }> = {};
    for (const name of queueNames) {
      result[name] = {
        deleteAvailable: this.registry.isDeleteAvailableEnabled(name),
        restartAvailable: this.registry.isRestartAvailableEnabled(name),
      };
    }

    return result;
  }

  public registerTask(type: EQueueType, options: QueueOptions, queueTaskInstance: QueueInterface) {
    const queueOptions = this.configService.getQueueOptions();
    const configOptions = queueOptions && queueOptions[type] ? queueOptions[type] : undefined;
    const effectiveOptions: Required<QueueOptions> = {
      deleteAvailable: options.deleteAvailable ?? DEFAULT_QUEUE_OPTIONS.deleteAvailable,
      enabled: options.enabled ?? DEFAULT_QUEUE_OPTIONS.enabled,
      log: configOptions?.log ?? options.log ?? DEFAULT_QUEUE_OPTIONS.log,
      maxAttempts: configOptions?.maxAttempts ?? options.maxAttempts ?? DEFAULT_QUEUE_OPTIONS.maxAttempts,
      parallelThreads: configOptions?.parallelThreads ?? options.parallelThreads ?? DEFAULT_QUEUE_OPTIONS.parallelThreads,
      preserveFailedItems: options.preserveFailedItems ?? DEFAULT_QUEUE_OPTIONS.preserveFailedItems,
      processingDelay: configOptions?.processingDelay ?? options.processingDelay ?? DEFAULT_QUEUE_OPTIONS.processingDelay,
      restartAvailable: options.restartAvailable ?? DEFAULT_QUEUE_OPTIONS.restartAvailable,
      timeout: configOptions?.timeout ?? options.timeout ?? DEFAULT_QUEUE_OPTIONS.timeout,
      transaction: options.transaction ?? DEFAULT_QUEUE_OPTIONS.transaction,
    };

    if (!effectiveOptions.enabled()) {
      this.logger.warn(`Skip initialization. Task ${type} is disabled`);

      return;
    }

    this.logger.info(`Init task ${type}, options ${JSON.stringify(effectiveOptions)}`);

    this.registry.setTask(type, queueTaskInstance);
    this.registry.setOptions(type, effectiveOptions);

    const currentParallelThreadsNumber = this.registry.getParallelThreadsNumber(type);
    const predefinedParallelThreadsNumber = effectiveOptions.parallelThreads;

    if (currentParallelThreadsNumber !== predefinedParallelThreadsNumber) {
      this.logger.info(`Parallel threads number for task ${type} was changed to ${currentParallelThreadsNumber}`);
    }
  }

  // db argument is needed to correctly add to queue inside transaction
  public async addToQueue(db: NonTxDbService, type: string, modifier: string, payload: string, priority = EQueuePriority.NORMAL, sort = '') {
    const threadNumber = this.getNextThreadNumber(type, modifier);
    if (threadNumber) {
      modifier = `${modifier}-thread-${threadNumber}`;
    }

    const queueItem = await db.withRepository(this.queueRepository).addToQueue(type, modifier, payload, priority, sort);
    this.logDebug(type, `Add to queue "${type}-${modifier}": item #${queueItem.id}, priority ${priority}, payload: ${this.cutPayload(payload)}`);

    this.queueEmitter.emit(EQueueEvent.RUN_QUEUE, queueItem.id);

    return queueItem;
  }

  public async prepareAllQueuesAfterReboot() {
    const tasks = await this.queueRepository.findBy({ status: EQueueStatus.IN_PROGRESS });

    for (const task of tasks) {
      const maxAttempts = this.registry.getMaxAttempts(task.type);
      const canBeDelayed = maxAttempts > 1 && (!task.attempt || task.attempt < maxAttempts);

      this.logger.warn(`Queue item #${task.id} (${task.type}) is IN_PROGRESS after reboot/shutdown. ${canBeDelayed ? 'Delay' : 'Fail' } it.`);

      await this.queueRepository.save({
        id: task.id!,
        status: canBeDelayed
          ? EQueueStatus.DELAYED
          : EQueueStatus.FAILED,
        error: 'Platform rebooted',
      });
    }

    return tasks;
  }

  public async runAllQueues() {
    this.logger.debug(`Run all queues`);

    await this.queueRepository.activateTasks();

    const queues = await this.queueRepository.getCurrentQueues();

    for (const queue of queues) {
      // runs asynchronously
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.runQueueAsync(queue.type, queue.modifier);
    }
  }

  public runQueue(type: string, modifier: string) {
    // runs asynchronously
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.runQueueAsync(type, modifier);
  }

  public async findDuplicates(queueItem: Queue) {
    const findCondition: FindOptionsWhere<Queue> = {
      type: queueItem.type,
      modifier: queueItem.modifier,
      payload: queueItem.payload,
    };

    if (queueItem.id) {
      findCondition.id = Not(queueItem.id);
    }

    return this.queueRepository.findBy(findCondition);
  }

  public async deleteByIds(ids: number[]) {
    return this.queueRepository.delete({ id: In(ids) });
  }

  public async deleteFromQueue(db: NonTxDbService, queueItem: Queue) {
    await this.queueRunner.deleteFromQueue(db, queueItem);
  }

  private async runQueueAsync(type: string, modifier: string) {
    if (this.registry.isQueueInProgress(type, modifier) || this.registry.isQueuePaused(type, modifier)) {
      return;
    }

    this.logDebug(type, `Run queue "${type}-${modifier}"`);

    this.registry.markQueueAsInProgress(type, modifier);

    while (!await this.queueRepository.isQueueEmpty(type, modifier) && !this.registry.isQueuePaused(type, modifier)) {
      const queueItems = await this.queueRepository.getQueue(type, modifier, QUEUE_PORTION_MAX_SIZE);
      for (const queueItem of queueItems) {
        await this.queueRepository.startTask(queueItem);
        await this.runQueueItem(queueItem);
      }
    }

    this.registry.markQueueAsDone(type, modifier);

    this.logDebug(type, `Stop queue "${type}-${modifier}"`);
  }

  private async runQueueItem(queueItem: Queue) {
    const queueTask = this.registry.getTask(queueItem.type);

    const useTransactionManager = this.registry.isTransactionEnabled(queueItem.type);

    if (useTransactionManager) {
      try {
        await lastValueFrom(this.http.post(this.queueItemProcessEndpoint, {
          id: queueItem.id,
          secretKey: this.configService.getSecretKeyForInternalRequest(),
        }));
      } catch (error: any) {
        this.logger.error(`Queue ${queueItem.type}: API failed: ${JSON.stringify(error.response?.data ?? (error.stack ?? error.message))}`);
      }
    } else {
      await this.queueRunner.processQueueItem(this.nonTxDb, queueItem, queueTask);
    }

    const processingDelay = this.registry.getProcessingDelay(queueItem.type);
    if (processingDelay) {
      await delay(processingDelay);
    }
  }

  private logDebug(type: string, message: string) {
    if (this.registry.isLogEnabled(type)) {
      this.logger.debug(message);
    }
  }

  private cutPayload(payload: string) {
    return payload.substring(0, 97) + (payload.length > 97 ? '...' : '');
  }

  private getNextThreadNumber(type: string, modifier: string) {
    const maxThreadNumber = this.registry.getParallelThreadsNumber(type);
    if (maxThreadNumber === 1) {
      return;
    }

    let nextThreadNumber = this.currentThreadNumbers.get(modifier) ?? 0;
    nextThreadNumber++;
    if (nextThreadNumber > maxThreadNumber!) {
      nextThreadNumber = 1;
    }
    this.currentThreadNumbers.set(modifier, nextThreadNumber);

    return nextThreadNumber;
  }

  private subscribeEvents() {
    this.queueEmitter.on(EQueueEvent.RUN_QUEUE, async (queueId) => {
      const queueItem = await this.nonTxDb.getRepository(Queue).findOneByOrFail({ id: queueId });

      this.runQueue(queueItem.type, queueItem.modifier);
    });
  }
}
