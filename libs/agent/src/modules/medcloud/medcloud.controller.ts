import { Body, Controller, HttpException, HttpStatus, RequestMethod } from '@nestjs/common';

import { UpdateStatusDto } from '~common/dto';
import { EAgentApiUrl, EScanStatusMapping } from '~common/enums';
import { Api } from '~core/api';

import { MedcloudService } from './medcloud.service';

@Controller()
export class MedcloudController {
  constructor(
    private readonly medcloudService: MedcloudService,
  ) {}

  @Api(EAgentApiUrl.MEDCLOUD_STATUS_UPDATE, { method: RequestMethod.POST })
  public async updateStatus(@Body() updateStatusData: UpdateStatusDto) {
    if (!updateStatusData.studyInstanceUid && !updateStatusData.accessionNumber) {
      throw new HttpException(`Field 'accessionNumber' is required`, HttpStatus.BAD_REQUEST);
    }

    if (!updateStatusData.studyInstanceUid && !updateStatusData.accessionIssuer) {
      throw new HttpException(`Field 'accessionIssuer' is required`, HttpStatus.BAD_REQUEST);
    }

    if (!Object.values(EScanStatusMapping).includes(updateStatusData.status)) {
      throw new HttpException(`Unknown status: ${updateStatusData.status}`, HttpStatus.BAD_REQUEST);
    }

    return this.medcloudService.updateStatus(updateStatusData);
  }
}
