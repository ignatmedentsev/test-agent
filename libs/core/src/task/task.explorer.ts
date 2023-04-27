import type { OnApplicationBootstrap } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { LogService } from '~core/log';

import { TASK_NAME, TASK_OPTIONS } from './task.constants';
import type { ITask, TTaskFunction } from './task.interfaces';
import { TaskService } from './task.service';

@Injectable()
export class TaskExplorer<T extends string, K extends TTaskFunction> implements OnApplicationBootstrap {
  constructor(
    private readonly taskService: TaskService<T, K>,
    private readonly discoveryService: DiscoveryService,
    private readonly logger: LogService,
  ) {
    logger.setContext(this.constructor.name);
  }

  public onApplicationBootstrap() {
    this.explore();
  }

  private explore() {
    const wrappers = this.discoveryService.getProviders();
    const taskWrappers = wrappers
      .filter((wrapper) => wrapper.metatype && Reflect.hasMetadata(TASK_NAME, wrapper.metatype));

    for (const wrapper of taskWrappers) {
      const name = Reflect.getMetadata(TASK_NAME, wrapper.metatype) as T;
      const options = Reflect.getMetadata(TASK_OPTIONS, wrapper.metatype);

      this.taskService.registerTask(name, options, wrapper.instance as ITask<K>);
      this.logger.info(`Task ${name} registered with runner ${wrapper.instance.constructor.name}`);
    }
  }
}
