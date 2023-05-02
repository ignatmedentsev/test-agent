import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AgentConfigService } from '~agent/services';
import { HEADLESS_APP_HTTPS_PORT, HEADLESS_APP_HTTP_PORT } from '~headless-app/constants';

@Injectable()
export class HeadlessConfigService extends AgentConfigService {
  constructor(
    configService: ConfigService,
  ) {
    super(configService);
    this.httpPort = HEADLESS_APP_HTTP_PORT;
    this.httpsPort = HEADLESS_APP_HTTPS_PORT;
  }

  public async setKey(key: string) {
    this.key = key;

    return Promise.resolve();
  }
}
