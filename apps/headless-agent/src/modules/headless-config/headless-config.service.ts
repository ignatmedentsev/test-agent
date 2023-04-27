import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AgentConfigService, PathService } from '~agent/services';
import { HEADLESS_APP_HTTP_PORT, HEADLESS_APP_HTTPS_PORT } from '~common/constants';

@Injectable()
export class HeadlessConfigService extends AgentConfigService {
  constructor(
    configService: ConfigService,
    pathService: PathService,
  ) {
    super(configService, pathService);
    this.httpPort = HEADLESS_APP_HTTP_PORT;
    this.httpsPort = HEADLESS_APP_HTTPS_PORT;
  }

  public async setKey(key: string) {
    this.key = key;

    return Promise.resolve();
  }
}
