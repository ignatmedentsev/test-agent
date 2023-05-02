import { Global, Module } from '@nestjs/common';

import { ApiClientModule } from '~core/api-client';

import { AgentApiClientService } from './agent-api-client.service';

@Global()
@Module({
  imports: [
    ApiClientModule,
  ],
  providers: [
    AgentApiClientService,
  ],
  exports: [AgentApiClientService],
})
export class AgentApiClientModule {}
