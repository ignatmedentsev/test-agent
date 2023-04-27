import type { OnApplicationBootstrap } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';

import { LogService } from '~core/log';

import { API_OPTIONS, API_URL } from './api.constants';
import { ApiRegistry } from './api.registry';

@Injectable()
export class ApiExplorer implements OnApplicationBootstrap {
  constructor(
    private readonly logger: LogService,
    private readonly apiRegistry: ApiRegistry,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  public onApplicationBootstrap() {
    this.explore();
  }

  private explore() {
    const wrappers = this.discoveryService.getControllers();

    for (const wrapper of wrappers) {
      const methodNames = this.metadataScanner.getAllFilteredMethodNames(wrapper.metatype.prototype);

      for (const methodName of methodNames) {
        if (Reflect.hasMetadata(API_URL, wrapper.metatype.prototype[methodName])) {
          const url = Reflect.getMetadata(API_URL, wrapper.metatype.prototype[methodName]) as string;
          const options = Reflect.getMetadata(API_OPTIONS, wrapper.metatype.prototype[methodName]);

          this.apiRegistry.setApiOptions(url, options);
        } else {
          const errorMessage = `API controller method "${methodName}" does not have a "@Api" decorator`;
          this.logger.error(errorMessage);

          throw new Error(errorMessage);
        }
      }
    }
  }
}
