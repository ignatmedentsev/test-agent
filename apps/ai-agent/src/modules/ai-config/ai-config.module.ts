import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiAgentConfigService } from '~ai-agent/services';
import { CoreConfigService } from '~core/services';

import { loadConfiguration } from './ai-config';
import { AiConfigService } from './ai-config.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ load: [loadConfiguration] })],
  providers: [
    AiConfigService,
    {
      provide: CoreConfigService,
      useExisting: AiConfigService,
    },
    {
      provide: AiAgentConfigService,
      useExisting: AiConfigService,
    },
  ],
  exports: [CoreConfigService, AiAgentConfigService],
})
export class AiConfigModule {}
