import { Global, Module } from '@nestjs/common';

import { AgentConfigService } from '~agent/services';
import { AuthService } from '~core/auth';
import { LogService } from '~core/log';

import { ApiClientService } from './api-client.service';
import { HttpApiService } from './http-api-service';
import { HttpRetryService } from './http-retry-service';

@Global()
@Module({
  providers: [
    ApiClientService,
    {
      provide: HttpRetryService,
      inject: [AgentConfigService, AuthService, LogService],
      useFactory: (configService: AgentConfigService, authService: AuthService, logService: LogService) => {
        return new HttpRetryService(configService, authService, logService);
      },
    },
    {
      provide: HttpApiService,
      inject: [AgentConfigService, AuthService, LogService],
      useFactory: (configService: AgentConfigService, authService: AuthService, logService: LogService) => {
        return new HttpApiService(configService, authService, logService);
      },
    },
  ],
  exports: [ApiClientService],
})
export class ApiClientModule {}
