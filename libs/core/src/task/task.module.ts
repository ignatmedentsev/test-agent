import type { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import type { TTaskFunction } from '~core/task/task.interfaces';

import { TaskExplorer } from './task.explorer';
import { TaskRegistry } from './task.registry';
import { TaskService } from './task.service';

@Module({})
export class TaskModule {
  public static forRoot<T extends string, K extends TTaskFunction>(): DynamicModule {
    return {
      module: TaskModule,
      imports: [
        DiscoveryModule,
      ],
      providers: [
        TaskRegistry<T, K>,
        TaskService<T, K>,
        TaskExplorer<T, K>,
      ],
    };
  }
}
