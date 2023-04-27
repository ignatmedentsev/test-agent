import { Injectable } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';

import type { CronOptions } from './cron.decorator';
import type { CronInterface } from './cron.interface';

@Injectable()
export class CronRegistry {
  private readonly tasks = new Map<string, CronInterface>();
  private readonly options = new Map<string, CronOptions>();
  private readonly started = new Map<string, boolean>();

  private times = new Map<string, string>();

  public setTask(name: string, task: CronInterface) {
    if (this.hasTask(name)) {
      throw new Error(`Cron task ${name} is already set`);
    }

    this.tasks.set(name, task);
  }

  public getTask(name: string) {
    if (!this.hasTask(name)) {
      throw new Error(`Cron task ${name} is not in registry`);
    }

    const task = this.tasks.get(name);

    if (!task) {
      throw new Error(`Cron task ${name} is not in registry`);
    }

    return task;
  }

  public getTasks() {
    return this.tasks;
  }

  public hasTask(name: string) {
    return this.tasks.has(name);
  }

  public setOptions(name: string, options: CronOptions) {
    if (this.hasOptions(name)) {
      throw new Error(`Cron options already set for task ${name}`);
    }

    this.options.set(name, options);
  }

  public getOptions(name: string) {
    if (!this.hasOptions(name)) {
      throw new Error(`Cron options for task ${name} are not in registry`);
    }

    const options = this.options.get(name);

    if (!options) {
      throw new Error(`Cron options for task ${name} are not in registry`);
    }

    return options;
  }

  public hasOptions(name: string) {
    return this.options.has(name);
  }

  public markTaskAsStarted(name: string) {
    this.started.set(name, true);
  }

  public markTaskAsFinished(name: string) {
    this.started.set(name, false);
  }

  public isTaskInProgress(name: string) {
    return this.started.has(name) && this.started.get(name);
  }

  public isLogEnabled(name: string) {
    const options = this.getOptions(name);

    return options?.log === undefined || options?.log;
  }

  public isTransactionEnabled(name: string) {
    const options = this.getOptions(name);

    return options?.transaction === undefined || options?.transaction;
  }

  public setTimes(times: Map<string, string>) {
    this.times = times;
  }

  public getTime(name: string) {
    if (this.times.has(name)) {
      return this.times.get(name) ?? CronExpression.EVERY_DAY_AT_MIDNIGHT;
    }

    return this.getOptions(name)?.time ?? CronExpression.EVERY_DAY_AT_MIDNIGHT;
  }

  public setTime(name: string, time: string) {
    this.times.set(name, time);
  }
}
