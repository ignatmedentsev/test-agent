import type { DynamicModule } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AgentConfigService } from '~agent/services';
import { CoreConfigService } from '~core/services';

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
        provide: CoreConfigService,
        useClass: HeadlessConfigService,
      },
      {
        provide: AgentConfigService,
        useClass: HeadlessConfigService,
      }],
      exports: [CoreConfigService, AgentConfigService],
    };
  }
}
