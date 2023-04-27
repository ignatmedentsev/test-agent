/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Injectable } from '@nestjs/common';

import { DeviceService } from '~agent/modules/device';
import type { SubmitExamDto, UpdateStatusDto } from '~common/dto';
import { EScanDeviceType } from '~common/enums';
import { ApiClientService } from '~core/api-client';

@Injectable()
export class MedcloudService {
  constructor(
    private readonly apiClientService: ApiClientService,
    private readonly deviceService: DeviceService,
  ) {}

  public async updateStatus(updateStatusData: UpdateStatusDto) {
    const device = this.deviceService.getDeviceByToken(updateStatusData.deviceToken)!;

    const exam: SubmitExamDto = {
      studyInstanceUid: updateStatusData.studyInstanceUid,
      accessionNumber: updateStatusData.accessionNumber,
      accessionIssuer: updateStatusData.accessionIssuer,
      isScan: true,
      scan: {
        deviceId: device.arcId,
        deviceType: EScanDeviceType.ARC,
        status: updateStatusData.status,
        errorMessage: updateStatusData.errorMessage ?? '',
      },
    };

    const error = await this.apiClientService.submitExamWithoutFormThroughAgent(exam);

    return error;
  }
}
