import { Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import type { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';

import { LogService } from '~core/log';
import { CoreConfigService } from '~core/services';

import { HttpService } from './http-service';

@Injectable()
export abstract class HttpRetryService extends HttpService {
  constructor(
    configService: CoreConfigService,
    logger: LogService,
    instance: AxiosInstance,
  ) {
    const retryOptions = configService.getHttpRetryOptions();

    axiosRetry(instance, {
      retries: retryOptions.retries,
      retryDelay: (retryCount, error: AxiosError<any>) => {
        this.logger.debug(`Retry attempt: ${retryCount} for url: "${error.config?.url}" `);

        return retryCount * retryOptions.retryDelay;
      },
      retryCondition: (error: AxiosError<any>) => {
        const errorLog = {
          url: `${error.config?.baseURL}${error.config?.url}`,
          status: error.response?.status || '',
          message: error.response?.data.message || '',
          errorStack: error.response?.data.stack || '',
        };
        this.logger.error(`Error from api: ${JSON.stringify(errorLog)}`);

        // Retry only if we haven't received a response from calling host
        return !!error.response;
      },
    });

    super(configService, logger, instance);
    this.logger.setContext(this.constructor.name);
  }

  public override onModuleInit() {
    this.initRequestLogInterceptor();
    this.initResponseLogInterceptor(false);
  }
}
