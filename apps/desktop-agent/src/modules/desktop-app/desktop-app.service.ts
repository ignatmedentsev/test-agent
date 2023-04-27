
import { Injectable } from '@nestjs/common';

import { AgentInitService } from '~agent/modules/agent';
import { OrganizationService } from '~agent/modules/organization';
import { AgentConfigService } from '~agent/services';
import { SocketClientService } from '~core/socket';

@Injectable()
export class DesktopAppService {
  constructor(
    private readonly agentInitService: AgentInitService,
    private readonly configService: AgentConfigService,
    private readonly organizationService: OrganizationService,
    private readonly socketClientService: SocketClientService,
  ) {}

  public async agentAuth(agentKey: string) {
    await this.configService.setKey(agentKey);

    const initInfo = await this.agentInitService.initAgent();
    if (!initInfo) {
      throw new Error(`Login failed`);
    }

    this.socketClientService.connect();

    return {
      token: initInfo.key,
      organizationInfo: this.organizationService.getOrganizationInfo(),
      userInfo: this.organizationService.getUserInfo(),
    };
  }
}
