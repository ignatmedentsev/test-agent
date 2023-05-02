import { Injectable } from '@nestjs/common';
import { Dataset } from 'dcmjs-dimse';
import fs from 'fs';

import { dicomStandardTags } from '~ai-agent/utils/dicom/dicomStandardTags';
import { EDicomTag } from '~common/enums';
import type { IDataset, IReferringPhysicianIdentificationSequence } from '~common/interfaces';
import type { TDeepPartial, TSendPlatformDicomPayload } from '~common/types';
import { create225Uid } from '~common/utils/uid';
import { LogService } from '~core/log';

import type { IDicomAiSender } from '../dicom-ai-sender/dicom-ai-sender.interfaces';

import { VetAiApiClientService } from './vet-ai-api-client';
import { EVetAiAnalysisModel } from './vet-ai-enums';
import type { IAdditionalData } from './vet-ai.interface';
import { VetAiService } from './vet-ai.service';

const VET_THORAX_BODYPART_VALUES = ['thorax', 'chest', 'breast'];

@Injectable()
export class VetAiSenderService implements IDicomAiSender {
  constructor(
    private readonly vetAiService: VetAiService,
    private readonly vetAiApiClientService: VetAiApiClientService,
    private readonly logger: LogService,
  ) {
    logger.setContext(this.constructor.name);
  }

  public async sendDicomToAi(receivedFilePath: string, payload: TSendPlatformDicomPayload) {
    const dicomDataset = Dataset.fromFile(receivedFilePath);

    if (!dicomDataset) {
      throw new Error(`No dataset found for AI dispatch: #${payload.aiDispatchId}`);
    }

    const bodyPart = dicomDataset.getElement(dicomStandardTags[EDicomTag.BODY_PART_EXAMINED].keyword);

    if (!bodyPart) {
      for (const [index, vetAiAnalysisModel] of Object.values(EVetAiAnalysisModel).entries()) {
        await this.sendToAiWithAnalysisModel(
          vetAiAnalysisModel,
          receivedFilePath,
          dicomDataset,
          payload,
          index,
        );
      }
    } else {
      if (VET_THORAX_BODYPART_VALUES.includes(bodyPart.toLowerCase())) {
        for (const [index, vetAiAnalysisModel] of [EVetAiAnalysisModel.THORAX, EVetAiAnalysisModel.VHS].entries()) {
          await this.sendToAiWithAnalysisModel(
            vetAiAnalysisModel,
            receivedFilePath,
            dicomDataset,
            payload,
            index,
          );
        }
      } else {
        await this.sendToAiWithAnalysisModel(
          EVetAiAnalysisModel.MUSCULOSKELETAL,
          receivedFilePath,
          dicomDataset,
          payload,
        );
      }
    }
  }

  private async sendToAiWithAnalysisModel(
    analysisModel: EVetAiAnalysisModel,
    receivedFilePath: string,
    dicomDataset: Dataset,
    payload: TSendPlatformDicomPayload,
    index = 1,
  ) {
    const {
      examId,
      filePath,
      pacsFileId,
      aiDispatchId,
      aiReportId,
      scanId,
    } = payload;

    const sopInstanceUid = this.generateSopInstanceUid(
      dicomDataset.getElement(dicomStandardTags[EDicomTag.SOP_INSTANCE_UID].keyword)!,
      payload,
      index,
    );

    const additionalData = {
      animalOnwer: dicomDataset.getElement(dicomStandardTags[EDicomTag.RESPONSIBLE_PERSON].keyword)
        || dicomDataset.getElement(dicomStandardTags[EDicomTag.REQUESTING_PHYSICIAN].keyword),
      animalId: dicomDataset.getElement(dicomStandardTags[EDicomTag.PATIENT_ID].keyword),
      animalNm: dicomDataset.getElement(dicomStandardTags[EDicomTag.PATIENT_NAME].keyword),
    } as IAdditionalData;

    const dataset: TDeepPartial<IDataset> = {
      SOPInstanceUID: sopInstanceUid,
      StudyDate: dicomDataset.getElement(dicomStandardTags[EDicomTag.STUDY_DATE].keyword),
      SeriesDate: dicomDataset.getElement(dicomStandardTags[EDicomTag.SERIES_DATE].keyword),
      StudyTime: dicomDataset.getElement(dicomStandardTags[EDicomTag.STUDY_TIME].keyword),
      AccessionNumber: dicomDataset.getElement(dicomStandardTags[EDicomTag.ACCESSION_NUMBER].keyword),
      InstitutionName: dicomDataset.getElement(dicomStandardTags[EDicomTag.INSTITUTION_NAME].keyword),
      ReferringPhysicianName: dicomDataset.getElement(dicomStandardTags[EDicomTag.REFERRING_PHYSICIAN_NAME].keyword),
      ReferringPhysicianIdentificationSequence: dicomDataset.getElement(
        dicomStandardTags[EDicomTag.REFERRING_PHYSICIAN_IDENTIFICATION_SEQUENCE].keyword,
      ) as any as IReferringPhysicianIdentificationSequence,
      StationName: dicomDataset.getElement(dicomStandardTags[EDicomTag.STATION_NAME].keyword),
      StudyDescription: dicomDataset.getElement(dicomStandardTags[EDicomTag.STUDY_DESCRIPTION].keyword),
      PatientName: dicomDataset.getElement(dicomStandardTags[EDicomTag.PATIENT_NAME].keyword),
      PatientID: dicomDataset.getElement(dicomStandardTags[EDicomTag.PATIENT_ID].keyword),
      PatientBirthDate: dicomDataset.getElement(dicomStandardTags[EDicomTag.PATIENT_BIRTH_DATE].keyword),
      PatientSex: dicomDataset.getElement(dicomStandardTags[EDicomTag.PATIENT_SEX].keyword),
      AdditionalPatientHistory: dicomDataset.getElement(dicomStandardTags[EDicomTag.ADDITIONAL_PATIENT_HISTORY].keyword),
      DeviceSerialNumber: dicomDataset.getElement(dicomStandardTags[EDicomTag.DEVICE_SERIAL_NUMBER].keyword),
      ProtocolName: dicomDataset.getElement(dicomStandardTags[EDicomTag.PROTOCOL_NAME].keyword),
      StudyInstanceUID: dicomDataset.getElement(dicomStandardTags[EDicomTag.STUDY_INSTANCE_UID].keyword),
      SeriesInstanceUID: this.generateSeriesInstanceUid(dicomDataset.getElement(dicomStandardTags[EDicomTag.SERIES_INSTANCE_UID].keyword)!, payload),
      StudyID: dicomDataset.getElement(dicomStandardTags[EDicomTag.STUDY_ID].keyword),
      InstanceNumber: index,
      ReasonForVisit: dicomDataset.getElement(dicomStandardTags[EDicomTag.REASON_FOR_VISIT_ATTRIBUTE].keyword),
    };

    this.logger.debug([
      `Sending exam #${examId} to VetAi, AnalysisModel : ${analysisModel}`,
      pacsFileId ? `, PACS file #${pacsFileId}` : '',
      aiDispatchId ? `, AI dispatch #${aiDispatchId}` : '',
      aiReportId ? `, AI report #${aiReportId}` : '',
      scanId ? `, scan #${scanId}` : '',
      ` sending: '${filePath}'`,
    ].join(''));

    const fileStream = fs.createReadStream(receivedFilePath);

    const analysisRequest = await this.vetAiApiClientService.analysisRequest(additionalData, analysisModel, fileStream);

    if (!analysisRequest) {
      throw new Error(`No analysis request found for AI dispatch: #${aiDispatchId}`);
    }

    this.logger.debug([
      `Sent exam #${examId} to VetAi, AnalysisModel : ${analysisModel}`,
      pacsFileId ? `, PACS file #${pacsFileId}` : '',
      aiDispatchId ? `, AI dispatch #${aiDispatchId}` : '',
      aiReportId ? `, AI report #${aiReportId}` : '',
      scanId ? `, scan #${scanId}` : '',
      ` request ID: ${analysisRequest.rsltData.reqId}`,
      ` result Code: ${analysisRequest.rsltCd}`,
      ` result Message: ${analysisRequest.rsltMsg}`,
    ].join(''));

    await this.vetAiService.saveVetAiAnalysisRequest(analysisRequest, aiDispatchId, dataset);
  }

  private generateSeriesInstanceUid(studyInstanceUid: string, payload: TSendPlatformDicomPayload) {
    return create225Uid(JSON.stringify({
      examId: payload.examId,
      scanId: payload.scanId,
      studyInstanceUid,
    }));
  }

  private generateSopInstanceUid(sopInstanceUid: string, payload: TSendPlatformDicomPayload, index?: number) {
    return create225Uid(JSON.stringify({
      examId: payload.examId,
      scanId: payload.scanId,
      sopInstanceUid,
      index,
    }));
  }
}
