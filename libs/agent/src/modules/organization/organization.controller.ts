import { Controller } from '@nestjs/common';

import { AgentConfigService } from '~agent/services';
import { EAgentApiUrl } from '~common/enums';
import type { IGetOrganizationInfo } from '~common/interfaces';
import { Api } from '~core/api';

import { OrganizationService } from './organization.service';

@Controller()
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly configService: AgentConfigService,
  ) {}

  @Api(EAgentApiUrl.GET_ORGANIZATION_INFO)
  public getOrganizationInfo() {
    return {
      organizationInfo: this.organizationService.getOrganizationInfo(),
      userInfo: this.organizationService.getUserInfo(),
      token: this.configService.getKey(),
    } as IGetOrganizationInfo;
  }
}
