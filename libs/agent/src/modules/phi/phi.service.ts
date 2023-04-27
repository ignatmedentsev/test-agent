import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import { Phi } from '~agent/entity';
import { DeviceService } from '~agent/modules/device';
import type { PhiDto, PhiPlatformDto } from '~common/dto';
import { EDicomTag, EDicomVr, EQueueType } from '~common/enums';
import type { TRequestPhiPayload, TUpdatePhiDataPayload } from '~common/types';
import { getStringValue } from '~common/utils/dicom';
import { NonTxDbService } from '~core/db';
import { LogService } from '~core/log';
import { QueueService } from '~core/queue';

import type { TPhiSendPayload } from './phi-sender.queue';

@Injectable()
export class PhiService {
  constructor(
    private readonly db: NonTxDbService, // DbService is not injected into the UpdatePhiDataTask
    private readonly queue: QueueService,
    private readonly deviceService: DeviceService,
    private readonly logger: LogService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  public async savePhi(phi: PhiDto) {
    const device = this.deviceService.getDeviceByToken(phi.deviceToken)!;

    const { arcId } = device;
    const phiDeviceId = getStringValue(phi.dicomData, EDicomTag.DEVICE_SERIAL_NUMBER);

    if (arcId !== phiDeviceId) {
      throw new Error(`Field PHI data 'Device Serial Number' (${phiDeviceId}) does not match ARC ID (${arcId})`);
    }

    const existedPhi = await this.db.getRepository(Phi).findOneBy({ sopInstanceUid: phi.sopInstanceUid });
    let savedPhi: Phi;

    if (existedPhi) {
      existedPhi.deviceId = device.id;
      existedPhi.studyInstanceUid = phi.studyInstanceUid;
      existedPhi.dicomData = phi.dicomData;

      savedPhi = await this.db.getRepository(Phi).save(existedPhi);
    } else {
      savedPhi = await this.db.getRepository(Phi).save({
        deviceId: device.id,
        sopInstanceUid: phi.sopInstanceUid,
        studyInstanceUid: phi.studyInstanceUid,
        dicomData: phi.dicomData,
      });
    }

    await this.queue.addToQueue(this.db, EQueueType.PHI_SENDER, 'common', JSON.stringify({ savedPhi, device } as TPhiSendPayload));
  }

  public async updatePhiDataFromDicom(dicomInfo: TUpdatePhiDataPayload) {
    for (const pacsFile of dicomInfo.pacsFiles) {
      const existedPhi = await this.db.getRepository(Phi).findOneBy({ sopInstanceUid: pacsFile.sopInstanceUid });

      if (!existedPhi) {
        throw new Error(`There is no PHI for sopInstanceUid ${pacsFile.sopInstanceUid})`);
      }

      existedPhi.dicomData[EDicomTag.BODY_PART_EXAMINED] = {
        vr: EDicomVr.CODE_STRING,
        Value: [dicomInfo.bodyPart || ''],
      };

      existedPhi.dicomData[EDicomTag.MODALITY] = {
        vr: EDicomVr.CODE_STRING,
        Value: [pacsFile.modalityCode || ''],
      };

      existedPhi.dicomData[EDicomTag.SERIES_NUMBER] = {
        vr: EDicomVr.INTEGER_STRING,
        Value: [`${pacsFile.seriesNumber}`],
      };

      await this.db.getRepository(Phi).update(existedPhi.id!, { dicomData: existedPhi.dicomData });
    }
  }

  public async getPhi(sopInstanceUid: string) {
    return this.db.getRepository(Phi).findOneBy({ sopInstanceUid });
  }

  public async getPhiBySopInstanceUids(sopInstanceUid: string[]) {
    return this.db.getRepository(Phi).findBy({ sopInstanceUid: In(sopInstanceUid) });
  }

  public async checkPhiExistence(sopInstanceUid: string) {
    return this.db.getRepository(Phi).exist({ where: { sopInstanceUid } });
  }

  public async sendPhiToPlatform(payload: TRequestPhiPayload) {
    const phis = await this.db.getRepository(Phi).find({ where: { sopInstanceUid: In(payload.sopInstanceUids) } });
    const phisForPlatform = phis.map((p) => {
      return { sopInstanceUid: p.sopInstanceUid, dicomData: p.dicomData };
    }) as PhiPlatformDto[];

    if (phisForPlatform.length === 0) {
      throw new Error(`There is no PHI for exam #${payload.examId}`);
    }

    return phisForPlatform;
  }
}
