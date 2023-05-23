
import { Injectable } from '@nestjs/common';

import { AgentInitService } from '~agent/modules/agent';
import { AgentApiClientService } from '~agent/modules/agent-api-client';
import { AgentConfigService } from '~agent/services';
import { SocketClientService } from '~core/socket';

@Injectable()
export class DesktopAppService {
  constructor(
    private readonly agentInitService: AgentInitService,
    private readonly configService: AgentConfigService,
    private readonly socketClientService: SocketClientService,
    private readonly agentApiClientService: AgentApiClientService,
  ) {}

  public async agentAuth(agentKey: string) {
    await this.configService.setKey(agentKey);

    const initInfo = await this.agentInitService.initAgent();
    if (!initInfo) {
      throw new Error(`Login failed`);
    }

    const { organizationInfo, userInfo } = await this.agentApiClientService.getOrganizationInfo();

    this.socketClientService.connect();

    return {
      token: initInfo.key,
      organizationInfo,
      userInfo,
    };
  }
}
