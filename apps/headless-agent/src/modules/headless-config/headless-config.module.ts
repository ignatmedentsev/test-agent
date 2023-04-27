import type { DynamicModule } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AgentConfigService, PathService } from '~agent/services';

import { loadConfiguration } from './headless-config';
import { HeadlessConfigService } from './headless-config.service';

@Global()
@Module({})
export class HeadlessConfigModule {
  static forRoot(): DynamicModule {
    return {
      module: HeadlessConfigModule,
      global: true,
      imports: [ConfigModule.forRoot({ load: [loadConfiguration] })],
      providers: [{
        provide: AgentConfigService,
        inject: [ConfigService, PathService],
        useFactory: (configService: ConfigService, pathService: PathService) => {
          return new HeadlessConfigService(configService, pathService);
        },
      }],
      exports: [AgentConfigService],
    };
  }
}
