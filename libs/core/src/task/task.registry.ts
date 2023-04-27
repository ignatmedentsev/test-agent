import { Injectable } from '@nestjs/common';

import type { ITask, ITaskOptions, TTaskFunction } from './task.interfaces';

@Injectable()
export class TaskRegistry<T extends string, K extends TTaskFunction> {
  private readonly tasks = new Map<T, { instance: ITask<K>, options: ITaskOptions}>();

  public setTask(name: T, instance: ITask<K>, options: ITaskOptions) {
    if (this.hasTask(name)) {
      throw new Error(`Task "${name}" is already set`);
    }

    this.tasks.set(name, { instance, options });
  }

  public hasTask(name: T) {
    return this.tasks.has(name);
  }

  public getTask(name: T) {
    if (!this.hasTask(name)) {
      throw new Error(`Task "${name}" is not in registry`);
    }

    return this.tasks.get(name);
  }

  public getTasks() {
    return this.tasks;
  }
}
