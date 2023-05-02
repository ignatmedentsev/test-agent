import { Global, Module } from '@nestjs/common';

import { ApiClientModule } from '~core/api-client';

import { AiAgentApiClientService } from './ai-agent-api-client.service';

@Global()
@Module({
  imports: [
    ApiClientModule,
  ],
  providers: [
    AiAgentApiClientService,
  ],
  exports: [AiAgentApiClientService],
})
export class AiAgentApiClientModule {}
