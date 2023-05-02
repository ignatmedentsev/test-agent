import type { OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { AxiosError } from 'axios';
import axios, { AxiosInstance } from 'axios';

import { AuthService } from '~core/auth';
import { LogService } from '~core/log';
import { CoreConfigService } from '~core/services';

import { HttpService } from './http-service';

@Injectable()
export class PlatformHttpService extends HttpService implements OnModuleInit {
  constructor(
    protected readonly authService: AuthService,
    configService: CoreConfigService,
    logger: LogService,
    instance?: AxiosInstance,
  ) {
    if (!instance) {
      instance = axios.create({ baseURL: configService.getPlatformApiUrl(), timeout: configService.getHttpTimeout() });
    }

    super(configService, logger, instance);
    this.logger.setContext(this.constructor.name);
  }

  public override onModuleInit() {
    this.initRequestLogInterceptor();
    this.addRequestAuthInterceptor();
    this.initResponseLogInterceptor();
    this.initResponseLogoutInterceptor();
  }

  protected initResponseLogoutInterceptor() {
    this.axiosRef.interceptors.response.use(
      undefined,
      async (error: AxiosError<any>) => {
        if (error?.status === 401 || error?.status === 403) {
          await this.authService.logout();
        }

        throw error;
      },
    );
  }

  protected addRequestAuthInterceptor() {
    const key = this.configService.getKey();

    this.axiosRef.interceptors.request.use(
      (config) => {
        if (config.headers && key) {
          config.headers.agentKey = `Bearer ${key}`;
        }

        return config;
      });
  }
}
