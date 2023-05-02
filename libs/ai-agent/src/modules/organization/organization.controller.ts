import { Controller } from '@nestjs/common';

import { AiAgentConfigService } from '~ai-agent/services';
import { EAgentApiUrl } from '~common/enums';
import type { IGetOrganizationInfo } from '~common/interfaces';
import { Api } from '~core/api';

import { OrganizationService } from './organization.service';

@Controller()
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly configService: AiAgentConfigService,
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
