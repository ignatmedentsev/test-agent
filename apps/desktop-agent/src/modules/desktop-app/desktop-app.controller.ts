import { Body, Controller } from '@nestjs/common';

import { EAgentApiUrl } from '~common/enums';
import { Api } from '~core/api';

import { DesktopAppService } from './desktop-app.service';

@Controller()
export class DesktopAppController {
  constructor(
    private readonly desktopAppService: DesktopAppService,
  ) {}

  @Api(EAgentApiUrl.AGENT_AUTH)
  public async agentAuth(@Body('agentKey') agentKey: string) {
    return this.desktopAppService.agentAuth(agentKey);
  }
}
