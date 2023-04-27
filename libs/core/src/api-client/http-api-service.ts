import { HttpService } from '@nestjs/axios';
import type { OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { AxiosError } from 'axios';
import { AxiosInstance } from 'axios';
import axios from 'axios';

import { AgentConfigService } from '~agent/services';
import { AuthService } from '~core/auth';
import { LogService } from '~core/log';

@Injectable()
export class HttpApiService extends HttpService implements OnModuleInit {
  constructor(
    protected readonly configService: AgentConfigService,
    protected readonly authService: AuthService,
    protected readonly logger: LogService,
    instance?: AxiosInstance,
  ) {
    if (!instance) {
      instance = axios.create({ baseURL: configService.getApiUrl(), timeout: configService.getHttpTimeout() });
    }

    super(instance);
    this.logger.setContext(this.constructor.name);
  }

  public onModuleInit() {
    this.initRequestInterceptor();
    this.initResponseInterceptor();
  }

  protected initRequestInterceptor() {
    this.axiosRef.interceptors.request.use(
      (config) => {
        this.logger.debug(`Request to platform from main url: ${config.baseURL}${config.url}`
          + (config.data
            ? `, data: '${this.logger.prepareData(config.data)}`
            : ''));

        const key = this.configService.getKey();
        if (config.headers && key) {
          config.headers.agentkey = `Bearer ${key}`;
        }

        return config;
      });
  }

  protected initResponseInterceptor(handleError = true) {
    this.axiosRef.interceptors.response.use(
      (response) => {
        if (response.headers['content-type'] === 'application/json') {
          this.logger.debug(`Response from platform url: ${response.request.url} data: ${this.logger.prepareData(response.data)}`);
        }

        return response;
      },
      handleError
        ? async (error: AxiosError<any>) => {
          const errorLog = {
            url: `${error.config?.baseURL}${error.config?.url}`,
            status: error.response?.status || '',
            message: error.response?.data.message || '',
            errorStack: error.response?.data.stack || '',
          };
          this.logger.error(`Error from api: ${this.logger.prepareData(errorLog)}`);

          if (errorLog.status === 401 || errorLog.status === 403) {
            await this.authService.logout();
          }
          throw error;
        }
        : undefined,
    );
  }
}
