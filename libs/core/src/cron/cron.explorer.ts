import type { OnApplicationBootstrap } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { CRON_NAME, CRON_OPTIONS } from './cron.constants';
import { CronService } from './cron.service';

@Injectable()
export class CronExplorer implements OnApplicationBootstrap {
  constructor(
    private readonly cronService: CronService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  public onApplicationBootstrap() {
    this.explore();
  }

  private explore() {
    const wrappers = this.discoveryService.getProviders();
    const cronWrappers = wrappers
      .filter((wrapper) => wrapper.metatype && Reflect.hasMetadata(CRON_NAME, wrapper.metatype));

    for (const wrapper of cronWrappers) {
      const name = Reflect.getMetadata(CRON_NAME, wrapper.metatype);
      const options = Reflect.getMetadata(CRON_OPTIONS, wrapper.metatype);

      this.cronService.registerTask(name, options, wrapper.instance);
    }
  }
}
