import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';

import { AgentPathService } from '~agent/services';
import { DesktopAgentConfigService } from '~agent/services/desktop-agent-config.service';
import type { IDesktopConfig } from '~common/interfaces';
import { DESKTOP_APP_HTTPS_PORT, DESKTOP_APP_HTTP_PORT } from '~desktop-app/constants';

@Injectable()
export class DesktopConfigService extends DesktopAgentConfigService {
  constructor(
    configService: ConfigService,
    protected readonly agentPathService: AgentPathService,
  ) {
    super(configService);
    this.httpPort = DESKTOP_APP_HTTP_PORT;
    this.httpsPort = DESKTOP_APP_HTTPS_PORT;
  }

  public async setKey(key: string) {
    const configPath = this.agentPathService.getPathToConfig();
    const config = JSON.parse(await fs.promises.readFile(configPath, 'utf-8')) as IDesktopConfig;

    config.key = key;

    await fs.promises.writeFile(configPath, JSON.stringify({ ...config }, undefined, 2), 'utf-8');

    this.key = key;
  }
}
