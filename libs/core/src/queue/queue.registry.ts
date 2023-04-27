import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

import type { QueueOptions } from './queue.decorator';
import type { QueueInterface } from './queue.interface';

@Injectable()
export class QueueRegistry extends EventEmitter {
  private readonly tasks = new Map<string, QueueInterface>();
  private readonly options = new Map<string, QueueOptions>();

  private parallelThreadsNumbers = new Map<string, number>();

  private readonly queueInProgressStatuses = new Array<{ type: string, modifier: string }>();
  private readonly queuePausedStatuses = new Array<{ type: string, modifier: string }>();

  public setTask(name: string, task: QueueInterface) {
    this.tasks.set(name, task);
  }

  public getTask(name: string) {
    if (!this.tasks.has(name)) {
      throw new Error(`Queue task ${name} is not in registry`);
    }

    const task = this.tasks.get(name);

    if (!task) {
      throw new Error(`Queue task ${name} is not in registry`);
    }

    return task;
  }

  public setOptions(name: string, options: QueueOptions) {
    this.options.set(name, options);
  }

  public getOptions(name: string) {
    if (!this.options.has(name)) {
      throw new Error(`Queue options for task ${name} are not in registry`);
    }

    return this.options.get(name);
  }

  public getTaskNames() {
    return this.options.keys();
  }

  public isLogEnabled(name: string) {
    const options = this.getOptions(name);

    return options?.log === undefined || options?.log;
  }

  public isTransactionEnabled(name: string) {
    const options = this.getOptions(name);

    return options?.transaction === undefined || options?.transaction;
  }

  public getMaxAttempts(name: string) {
    const options = this.getOptions(name);

    return options?.maxAttempts ?? 1;
  }

  public getProcessingDelay(name: string) {
    const options = this.getOptions(name);

    return options?.processingDelay ?? 0;
  }

  public getTimeout(name: string) {
    const options = this.getOptions(name);

    return options?.timeout ?? 300000; // 5 minutes
  }

  public setParallelThreadsNumbers(parallelThreadsNumbers: Map<string, number>) {
    this.parallelThreadsNumbers = parallelThreadsNumbers;
  }

  public setParallelThreadsNumber(name: string, parallelThreadsNumber: number) {
    this.parallelThreadsNumbers.set(name, parallelThreadsNumber);
  }

  public getParallelThreadsNumber(name: string) {
    if (this.parallelThreadsNumbers.has(name)) {
      return this.parallelThreadsNumbers.get(name);
    }

    const options = this.getOptions(name);

    return options?.parallelThreads ?? 1;
  }

  public isRestartAvailableEnabled(name: string) {
    const options = this.getOptions(name);

    return options?.restartAvailable === undefined || options?.restartAvailable;
  }

  public isDeleteAvailableEnabled(name: string) {
    const options = this.getOptions(name);

    return options?.deleteAvailable === undefined || options?.deleteAvailable;
  }

  public isPreserveFailedItemsEnabled(name: string) {
    const options = this.getOptions(name);

    return options?.preserveFailedItems === undefined || options?.preserveFailedItems;
  }

  public isQueueInProgress(type: string, modifier: string) {
    return !!this.queueInProgressStatuses.find(o => o.type === type && o.modifier === modifier);
  }

  public isQueuePaused(type: string, modifier: string) {
    return !!this.queuePausedStatuses.find(o => o.type === type && o.modifier === modifier);
  }

  public markQueueAsPaused(type: string, modifier: string) {
    this.queuePausedStatuses.push({ type, modifier });
  }

  public markQueueAsNotPaused(type: string, modifier: string) {
    const qs = this.queuePausedStatuses.find(o => o.type === type && o.modifier === modifier);
    const index = this.queuePausedStatuses.indexOf(qs!);
    if (index > -1) {
      this.queuePausedStatuses.splice(index, 1);
    }
  }

  public markQueueAsInProgress(type: string, modifier: string) {
    this.queueInProgressStatuses.push({ type, modifier });
  }

  public markQueueAsDone(type: string, modifier: string) {
    const qs = this.queueInProgressStatuses.find(o => o.type === type && o.modifier === modifier);
    const index = this.queueInProgressStatuses.indexOf(qs!);
    if (index > -1) {
      this.queueInProgressStatuses.splice(index, 1);
    }

    this.emit(this.buildQueueDoneEventName(type, modifier));
  }

  public subscribeOnQueueDone(type: string, modifier: string, callback: (...args: any[]) => void) {
    this.once(this.buildQueueDoneEventName(type, modifier), callback);
  }

  private buildQueueDoneEventName(type: string, modifier: string) {
    return `${type}-${modifier}-queue-done`;
  }
}
