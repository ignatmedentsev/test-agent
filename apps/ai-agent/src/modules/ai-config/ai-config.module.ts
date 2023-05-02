import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiAgentConfigService } from '~ai-agent/services';
import { CoreConfigService } from '~core/services';

import { loadConfiguration } from './ai-config';
import { AiConfigService } from './ai-config.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ load: [loadConfiguration] })],
  providers: [{
    provide: CoreConfigService,
    useClass: AiConfigService,
  },
  {
    provide: AiAgentConfigService,
    useClass: AiConfigService,
  }],
  exports: [CoreConfigService, AiAgentConfigService],
})
export class AiConfigModule {}
