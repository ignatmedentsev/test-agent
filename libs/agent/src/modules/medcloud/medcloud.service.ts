/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Injectable } from '@nestjs/common';

import { AgentApiClientService } from '~agent/modules/agent-api-client';
import { DeviceService } from '~agent/modules/device';
import type { SubmitExamDto, UpdateStatusDto } from '~common/dto';
import { EScanDeviceType } from '~common/enums';

@Injectable()
export class MedcloudService {
  constructor(
    private readonly agentApiClientService: AgentApiClientService,
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

    const error = await this.agentApiClientService.submitExamWithoutFormThroughAgent(exam);

    return error;
  }
}
