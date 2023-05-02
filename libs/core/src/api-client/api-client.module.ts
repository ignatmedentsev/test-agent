import { Module } from '@nestjs/common';

import { AuthService } from '~core/auth';
import { LogService } from '~core/log';
import { CoreConfigService } from '~core/services';

import { PlatformApiClientService } from './platform-api-client.service';
import { PlatformHttpRetryService } from './platform-http-retry-service';
import { PlatformHttpService } from './platform-http-service';

@Module({
  providers: [
    PlatformApiClientService,
    {
      provide: PlatformHttpRetryService,
      inject: [AuthService, CoreConfigService, LogService],
      useFactory: (authService: AuthService, configService: CoreConfigService, logService: LogService) => {
        return new PlatformHttpRetryService(authService, configService, logService);
      },
    },
    {
      provide: PlatformHttpService,
      inject: [AuthService, CoreConfigService, LogService],
      useFactory: (authService: AuthService, configService: CoreConfigService, logService: LogService) => {
        return new PlatformHttpService(authService, configService, logService);
      },
    },
  ],
  exports: [
    PlatformApiClientService,
    PlatformHttpService,
    PlatformHttpRetryService,
  ],
})
export class ApiClientModule {}
