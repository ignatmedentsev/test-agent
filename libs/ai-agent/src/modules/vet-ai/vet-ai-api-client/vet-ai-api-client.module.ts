import { Module } from '@nestjs/common';

import { AiAgentConfigService } from '~ai-agent/services';
import { ApiClientModule } from '~core/api-client';
import { LogService } from '~core/log';

import { VetAiApiClientService } from './vet-ai-api-client.service';
import { VetAiHttpService } from './vet-ai-http-service';

@Module({
  imports: [
    ApiClientModule,
  ],
  providers: [
    VetAiApiClientService,
    VetAiHttpService,
    {
      provide: VetAiHttpService,
      inject: [AiAgentConfigService, LogService],
      useFactory: (configService: AiAgentConfigService, logService: LogService) => {
        return new VetAiHttpService(configService, logService);
      },
    },
  ],
  exports: [VetAiApiClientService, VetAiHttpService],
})
export class VetAiApiClientModule {}
