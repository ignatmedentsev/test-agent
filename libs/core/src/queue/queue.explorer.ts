import type { OnApplicationBootstrap } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { QUEUE_NAME, QUEUE_OPTIONS } from './queue.constants';
import { QueueService } from './queue.service';

@Injectable()
export class QueueExplorer implements OnApplicationBootstrap {
  constructor(
    private readonly queueService: QueueService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  public onApplicationBootstrap() {
    this.explore();
  }

  private explore() {
    const wrappers = this.discoveryService.getProviders();
    const queueWrappers = wrappers
      .filter((wrapper) => wrapper.metatype && Reflect.hasMetadata(QUEUE_NAME, wrapper.metatype));
    for (const wrapper of queueWrappers) {
      const name = Reflect.getMetadata(QUEUE_NAME, wrapper.metatype);
      let options = Reflect.getMetadata(QUEUE_OPTIONS, wrapper.metatype);

      this.queueService.registerTask(name, options, wrapper.instance);
    }
  }
}
