import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AiAgentConfigService } from '~ai-agent/services';

import { AI_APP_HTTP_PORT, AI_APP_HTTPS_PORT } from '../../constants';

@Injectable()
export class AiConfigService extends AiAgentConfigService {
  constructor(
    configService: ConfigService,
  ) {
    super(configService);
    this.httpPort = AI_APP_HTTP_PORT;
    this.httpsPort = AI_APP_HTTPS_PORT;
  }

  public async setKey(key: string) {
    this.key = key;

    return Promise.resolve();
  }
}
