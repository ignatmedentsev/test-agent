import type { DynamicModule } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AgentConfigService, DesktopAgentConfigService } from '~agent/services';
import { CoreConfigService } from '~core/services';

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
        provide: CoreConfigService,
        useClass: DesktopConfigService,
      },
      {
        provide: AgentConfigService,
        useClass: DesktopConfigService,

      },
      {
        provide: DesktopAgentConfigService,
        useClass: DesktopConfigService,
      }],
      exports: [CoreConfigService, DesktopAgentConfigService, AgentConfigService],
    };
  }
}
