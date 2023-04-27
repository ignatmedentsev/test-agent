import type { DynamicModule } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AgentConfigService, PathService } from '~agent/services';

import { loadConfiguration } from './desktop-config';
import { DesktopConfigService } from './desktop-config.service';

@Global()
@Module({})
export class DesktopConfigModule {
  static forRoot(): DynamicModule {
    return {
      module: DesktopConfigModule,
      global: true,
      imports: [ConfigModule.forRoot({ load: [loadConfiguration] })],
      providers: [{
        provide: AgentConfigService,
        inject: [ConfigService, PathService],
        useFactory: (configService: ConfigService, pathService: PathService) => {
          return new DesktopConfigService(configService, pathService);
        },
      }],
      exports: [AgentConfigService],
    };
  }
}
