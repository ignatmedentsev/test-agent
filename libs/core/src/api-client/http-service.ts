import { HttpService as NestHttpService } from '@nestjs/axios';
import type { OnModuleInit } from '@nestjs/common';
import type { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';

import type { LogService } from '~core/log';
import type { CoreConfigService } from '~core/services';

export abstract class HttpService extends NestHttpService implements OnModuleInit {
  constructor(
    protected readonly configService: CoreConfigService,
    protected readonly logger: LogService,
    instance: AxiosInstance,
  ) {
    super(instance);
    this.logger.setContext(this.constructor.name);
  }

  public onModuleInit() {
    this.initRequestLogInterceptor();
    this.initResponseLogInterceptor();
  }

  protected initRequestLogInterceptor() {
    this.axiosRef.interceptors.request.use(
      (config) => {
        this.logger.debug(`Request to url: "${config.baseURL}${config.url}"`
          + (config.data
            ? `, data: '${this.logger.prepareData(config.data)}`
            : ''));

        return config;
      });
  }

  protected initResponseLogInterceptor(handleError = true) {
    this.axiosRef.interceptors.response.use(
      (response) => {
        if (response.headers['content-type'] === 'application/json') {
          this.logger.debug(`Response from url:"${response.config.baseURL}${response.config.url}}" data: ${this.logger.prepareData(response.data)}`);
        }

        return response;
      },
      handleError ? (error: AxiosError<any>) => {
        const errorLog = {
          url: `${error.config?.baseURL}${error.config?.url}`,
          status: error.response?.status || '',
          message: error.response?.data.message || '',
          errorStack: error.response?.data.stack || '',
        };
        this.logger.error(`Error from api: ${this.logger.prepareData(errorLog)}`);

        throw error;
      } : undefined,
    );
  }
}
