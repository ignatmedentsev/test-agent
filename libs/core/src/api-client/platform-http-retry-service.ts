import { Injectable } from '@nestjs/common';
import type { AxiosError } from 'axios';
import axios from 'axios';
import axiosRetry from 'axios-retry';

import { AuthService } from '~core/auth';
import { LogService } from '~core/log';
import { CoreConfigService } from '~core/services';

import { PlatformHttpService } from './platform-http-service';

@Injectable()
export class PlatformHttpRetryService extends PlatformHttpService {
  constructor(
    authService: AuthService,
    configService: CoreConfigService,
    logger: LogService,
  ) {
    const instance = axios.create({ baseURL: configService.getPlatformApiUrl(), timeout: configService.getHttpTimeout() });
    const retryOptions = configService.getHttpRetryOptions();

    axiosRetry(instance, {
      retries: retryOptions.retries,
      retryDelay: (retryCount, error: AxiosError<any>) => {
        this.logger.debug(`Retry attempt: ${retryCount} for url: "${error.config?.url}" `);

        return retryCount * retryOptions.retryDelay;
      },
      retryCondition: async (error: AxiosError<any>) => {
        const errorLog = {
          url: `${error.config?.baseURL}${error.config?.url}`,
          status: error.response?.status || '',
          message: error.response?.data.message || '',
          errorStack: error.response?.data.stack || '',
        };
        this.logger.error(`Error from api: ${JSON.stringify(errorLog)}`);

        if (errorLog.status === 401) {
          await this.authService.logout();
        }

        // Retry only if we haven't received a response from the platform or if got 404 code
        return !!error.response || errorLog.status === 404;
      },
    });

    super(authService, configService, logger, instance);
    this.logger.setContext(this.constructor.name);
  }

  public override onModuleInit() {
    this.initRequestLogInterceptor();
    this.addRequestAuthInterceptor();
    this.initResponseLogInterceptor(false);
    this.initResponseLogoutInterceptor();
  }
}
