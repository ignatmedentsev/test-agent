import { Body, Controller, UseGuards, UsePipes } from '@nestjs/common';

import { DeviceGuard } from '~agent/modules/device';
import { HttpsOnlyGuard } from '~agent/modules/https';
import { PhiDto } from '~common/dto';
import { EAgentApiUrl } from '~common/enums';
import { Api } from '~core/api';

import { PhiValidationPipe } from './phi.pipe';
import { PhiService } from './phi.service';

@Controller()
export class PhiController {
  constructor(
    private readonly phiService: PhiService,
  ) {}

  // TODO: Rework HttpsOnlyGuard to AllowHttpGuard. Only allowed APIs should be available via http
  @UseGuards(HttpsOnlyGuard, DeviceGuard)
  @UsePipes(PhiValidationPipe)
  @Api(EAgentApiUrl.PHI_SAVE)
  public async savePhi(@Body() phi: PhiDto) {
    return this.phiService.savePhi(phi);
  }
}
