import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';

import { AgentConfigService, PathService } from '~agent/services';
import { DESKTOP_APP_HTTP_PORT, DESKTOP_APP_HTTPS_PORT } from '~common/constants';
import type { IConfig } from '~common/interfaces';

@Injectable()
export class DesktopConfigService extends AgentConfigService {
  constructor(
    configService: ConfigService,
    pathService: PathService,
  ) {
    super(configService, pathService);
    this.httpPort = DESKTOP_APP_HTTP_PORT;
    this.httpsPort = DESKTOP_APP_HTTPS_PORT;
  }

  public async setKey(key: string) {
    const configPath = this.pathService.getPathToConfig();
    const config = JSON.parse(await fs.promises.readFile(configPath, 'utf-8')) as IConfig;

    if (!key) {
      delete config.key;
    } else {
      config.key = key;
    }

    await fs.promises.writeFile(configPath, JSON.stringify({ ...config }, undefined, 2), 'utf-8');

    this.key = key;
  }
}
