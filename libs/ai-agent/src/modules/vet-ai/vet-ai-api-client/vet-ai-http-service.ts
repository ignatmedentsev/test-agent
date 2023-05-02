import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { AiAgentConfigService } from '~ai-agent/services';
import type { IVetAiOptions } from '~common/interfaces/IVetAiConfig';
import { HttpService } from '~core/api-client';
import { LogService } from '~core/log';

@Injectable()
export class VetAiHttpService extends HttpService {
  private readonly vetAiOptions: IVetAiOptions;
  constructor(
    configService: AiAgentConfigService,
    logger: LogService,
  ) {
    const vetAiOptions = configService.getVetAiOptions();
    const instance = axios.create({ baseURL: vetAiOptions?.hostUrl, timeout: configService.getHttpTimeout() });

    super(configService, logger, instance);
    this.vetAiOptions = vetAiOptions;
    this.logger.setContext(this.constructor.name);
  }

  public override onModuleInit() {
    this.initRequestLogInterceptor();
    this.addRequestAuthInterceptor();
    this.initResponseLogInterceptor();
  }

  protected addRequestAuthInterceptor() {
    const key = this.vetAiOptions?.authKey;

    this.axiosRef.interceptors.request.use(
      (config) => {
        if (config.headers && key) {
          config.headers.Authorization = `${key}`;
        }

        return config;
      });
  }
}
