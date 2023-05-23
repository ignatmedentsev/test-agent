import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import fs from 'fs';
import merge from 'lodash/merge';
import path from 'path';

import { DicomSenderService } from '~agent/modules/dicom-sender';
import { AgentPathService } from '~agent/services';
import type { PhiPlatformDto } from '~common/dto';
import { EDicomTag, EDicomVr } from '~common/enums';
import type { IDataset, IUids } from '~common/interfaces';
import type {
  TDicomData,
  TRequestStudyNotesPayload,
  TStudyData,
  TSendStudyNotesPayload,
  TDeepPartial,
} from '~common/types';
import { create225Uid } from '~common/utils/uid';

import { ParseDicomService } from '../pacs';
import { PhiService } from '../phi';

import { StudyDataService } from './study-data.service';
import { SVGGenerator } from './svg-generator';

const dcmjs = require('dcmjs');

const DEFAULT_EMPTY_VALUE = '-';
const STUDY_NOTES_SERIES_NUMBER = 999;
const STUDY_NOTES_SERIES_DESCRIPTION = 'Study Notes';

@Injectable()
export class StudyNotesService {
  constructor(
    private readonly dicomSender: DicomSenderService,
    private readonly parseDicomService: ParseDicomService,
    private readonly agentPathService: AgentPathService,
    private readonly phiService: PhiService,
    private readonly studyDataService: StudyDataService,
  ) {}

  public async sendStudyNotes(payload: TSendStudyNotesPayload) {
    const { realSopInstanceUid, realSeriesInstanceUid } = this.generateUids(payload);
    const pathToStudyNotesDicom = this.getStudyNotePath(payload);

    if (!payload.sopInstanceUids || payload.sopInstanceUids.length === 0) {
      throw new Error(`Can't send study notes: list of SOP Instance UIDs is empty`);
    }

    const rawPhiBySopInstanceUids = await this.phiService.getPhiBySopInstanceUids(payload.sopInstanceUids);
    if (!rawPhiBySopInstanceUids.length) {
      throw new Error(`PHI not found for exam #${payload.examId}`);
    }

    const phiPatchingData = rawPhiBySopInstanceUids[0]!.dicomData;

    const patchDataset: TDeepPartial<IDataset> = {
      SOPInstanceUID: realSopInstanceUid,
      StudyDate: this.getStringValue(phiPatchingData, EDicomTag.STUDY_DATE),
      SeriesDate: this.getStringValue(phiPatchingData, EDicomTag.SERIES_DATE),
      StudyTime: this.getStringValue(phiPatchingData, EDicomTag.STUDY_TIME),
      AccessionNumber: this.getStringValue(phiPatchingData, EDicomTag.ACCESSION_NUMBER),
      InstitutionName: this.getStringValue(phiPatchingData, EDicomTag.INSTITUTION_NAME),
      ReferringPhysicianName: this.getReferringPhysicianNameString(phiPatchingData),
      ReferringPhysicianIdentificationSequence: {
        InstitutionName: this.getReferringPhysicianSequenceValue(phiPatchingData, EDicomTag.INSTITUTION_NAME),
        PersonTelephoneNumbers: this.getReferringPhysicianSequenceValue(phiPatchingData, EDicomTag.REFERRING_PHYSICIAN_PHONE),
        PersonTelecomInformation: this.getReferringPhysicianSequenceValue(phiPatchingData, EDicomTag.PERSON_TELECOM_INFORMATION),
      },
      StationName: this.getStringValue(phiPatchingData, EDicomTag.STATION_NAME),
      StudyDescription: this.getStringValue(phiPatchingData, EDicomTag.STUDY_DESCRIPTION),
      SeriesDescription: STUDY_NOTES_SERIES_DESCRIPTION,
      PatientName: this.getPatientNameString(phiPatchingData),
      PatientID: this.getStringValue(phiPatchingData, EDicomTag.PATIENT_ID),
      PatientBirthDate: this.getStringValue(phiPatchingData, EDicomTag.PATIENT_BIRTH_DATE),
      PatientSex: this.getStringValue(phiPatchingData, EDicomTag.PATIENT_SEX),
      AdditionalPatientHistory: this.getStringValue(phiPatchingData, EDicomTag.ADDITIONAL_PATIENT_HISTORY),
      DeviceSerialNumber: this.getStringValue(phiPatchingData, EDicomTag.DEVICE_SERIAL_NUMBER),
      ProtocolName: this.getStringValue(phiPatchingData, EDicomTag.PROTOCOL_NAME),
      StudyInstanceUID: this.getStringValue(phiPatchingData, EDicomTag.STUDY_INSTANCE_UID),
      SeriesInstanceUID: realSeriesInstanceUid,
      StudyID: this.getStringValue(phiPatchingData, EDicomTag.STUDY_ID),
      SeriesNumber: STUDY_NOTES_SERIES_NUMBER,
      InstanceNumber: 1,
      ReasonForVisit: this.getStringValue(phiPatchingData, EDicomTag.REASON_FOR_VISIT_ATTRIBUTE),
      _meta: {
        MediaStorageSOPInstanceUID: {
          Value: [
            realSopInstanceUid,
          ],
          vr: EDicomVr.UID,
        },
      },
    };

    try {
      await this.generateStudyNotesDicom(
        this.studyDataService.generateStudyData(rawPhiBySopInstanceUids),
        patchDataset,
        pathToStudyNotesDicom,
      );

      await this.dicomSender.sendDicomFile(pathToStudyNotesDicom, payload.pacsServer);
    } finally {
      if (fs.existsSync(pathToStudyNotesDicom)) {
        await fs.promises.unlink(pathToStudyNotesDicom);
      }
    }
  }

  public async requestStudyNotes(payload: TRequestStudyNotesPayload) {
    if (!payload.sopInstanceUids || payload.sopInstanceUids.length === 0) {
      throw new Error(`Can't send study notes: list of SOP Instance UIDs is empty`);
    }

    const rawPhiBySopInstanceUids = await this.phiService.getPhiBySopInstanceUids(payload.sopInstanceUids);
    if (!rawPhiBySopInstanceUids.length) {
      throw new Error(`PHI not found for exam #${payload.examId}`);
    }
    const { fakeSeriesInstanceUid, fakeSopInstanceUid, realSopInstanceUid, realSeriesInstanceUid } = this.generateUids(payload);
    const pathToStudyNotesDicom = this.getStudyNotePath(payload);

    const phiPatchingData = rawPhiBySopInstanceUids[0]!.dicomData;

    const patchDataset: TDeepPartial<IDataset> = {
      SOPInstanceUID: fakeSopInstanceUid,
      StudyInstanceUID: rawPhiBySopInstanceUids[0]!.studyInstanceUid,
      SeriesInstanceUID: fakeSeriesInstanceUid,
      StudyDescription: this.getStringValue(phiPatchingData, EDicomTag.STUDY_DESCRIPTION),
      InstanceNumber: 1,
      _meta: {
        MediaStorageSOPInstanceUID: {
          Value: [
            fakeSopInstanceUid,
          ],
          vr: EDicomVr.UID,
        },
      },
    };
    await this.generateStudyNotesDicom(
      this.studyDataService.generateStudyData(rawPhiBySopInstanceUids),
      patchDataset,
      pathToStudyNotesDicom,
    );

    const pacsFileInfo = this.parseDicomService.parseDicom({
      dicomBuffer: await fs.promises.readFile(pathToStudyNotesDicom),
      uids: {} as IUids,
      callingAet: 'Agent',
    });

    pacsFileInfo.isStudyNotes = true;

    const phiForStudyNotes: PhiPlatformDto = {
      dicomData: {
        ...phiPatchingData,
        [EDicomTag.MODALITY]: {
          Value: [
            'OT',
          ],
          vr: EDicomVr.CODE_STRING,
        },
        [EDicomTag.SOP_INSTANCE_UID]: {
          Value: [
            realSopInstanceUid,
          ],
          vr: EDicomVr.UID,
        },
        [EDicomTag.SERIES_DESCRIPTION]: {
          Value: [
            STUDY_NOTES_SERIES_DESCRIPTION,
          ],
          vr: EDicomVr.LONG_STRING,
        },
        [EDicomTag.SERIES_INSTANCE_UID]: {
          Value: [
            realSeriesInstanceUid,
          ],
          vr: EDicomVr.UID,
        },
        [EDicomTag.SERIES_NUMBER]: {
          Value: [
            `${STUDY_NOTES_SERIES_NUMBER}`,
          ],
          vr: EDicomVr.INTEGER_STRING,
        },
      } as TDicomData,
      sopInstanceUid: fakeSopInstanceUid,
    };

    const uploadedFileStream = fs.createReadStream(pathToStudyNotesDicom);

    uploadedFileStream.on('end', async () => {
      if (fs.existsSync(pathToStudyNotesDicom)) {
        await fs.promises.unlink(pathToStudyNotesDicom);
      }
    });

    return {
      pacsFileInfo,
      phiForStudyNotes,
      uploadedFile: uploadedFileStream,
    };
  }

  public async cleanupStudyNotes(payload: TRequestStudyNotesPayload) {
    const pathToStudyNotesDicom = this.getStudyNotePath(payload);
    if (fs.existsSync(pathToStudyNotesDicom)) {
      await fs.promises.unlink(pathToStudyNotesDicom);
    }
  }

  private generateUids(payload: TRequestStudyNotesPayload | TSendStudyNotesPayload) {
    const fakeSeriesInstanceUid = create225Uid(JSON.stringify({
      examId: payload.examId,
      scanId: payload.scanId,
      type: 'fake',
      seriesNumber: STUDY_NOTES_SERIES_NUMBER,
    }));

    const realSeriesInstanceUid = create225Uid(JSON.stringify({
      examId: payload.examId,
      scanId: payload.scanId,
      type: 'real',
      seriesNumber: STUDY_NOTES_SERIES_NUMBER,
    }));

    const fakeSopInstanceUid = create225Uid(JSON.stringify({
      examId: payload.examId,
      scanId: payload.scanId,
      type: 'fake',
    }));

    const realSopInstanceUid = create225Uid(JSON.stringify({
      examId: payload.examId,
      scanId: payload.scanId,
      type: 'real',
    }));

    return { fakeSeriesInstanceUid, fakeSopInstanceUid, realSopInstanceUid, realSeriesInstanceUid };
  }

  private async generateStudyNotesDicom(
    studyData: TStudyData,
    patchDataset: TDeepPartial<IDataset>,
    pathToStudyNotes: string,
  ) {
    const sharpObject = SVGGenerator.renderTemplate(studyData);

    const pixelData = new Uint8Array(await sharpObject
      .jpeg()
      .toBuffer());

    const baseDataset: TDeepPartial<IDataset> = {
      SOPClassUID: '1.2.840.10008.5.1.4.1.1.7',
      ContentDate: '',
      SeriesTime: '',
      ContentTime: '',
      ConversionType: 'SI',
      Modality: 'OT',
      PatientOrientation: '',
      SamplesPerPixel: 3,
      PhotometricInterpretation: 'YBR_FULL_422',
      PlanarConfiguration: 0,
      Rows: 1200,
      Columns: 1200,
      BitsAllocated: 8,
      BitsStored: 8,
      HighBit: 7,
      PixelRepresentation: 0,
      LossyImageCompression: '01',
      _meta: {
        FileMetaInformationVersion: {
          Value: [
            {
              0: 0,
              1: 1,
            },
          ],
          vr: EDicomVr.OTHER_BYTE_STRING,
        },
        MediaStorageSOPClassUID: {
          Value: [
            '1.2.840.10008.5.1.4.1.1.7',
          ],
          vr: EDicomVr.UID,
        },
        TransferSyntaxUID: {
          Value: [
            '1.2.840.10008.1.2.4.50',
          ],
          vr: EDicomVr.UID,
        },
      },
      _vrMap: { PixelData: 'OW' },
    };

    const dataset = merge(baseDataset, patchDataset) as IDataset;
    dataset.PixelData = pixelData.buffer;

    const dicomDict = dcmjs.data.datasetToDict(dataset);

    const buffer = Buffer.from(dicomDict.write({ framentMultiframe: false }));

    await fs.promises.writeFile(pathToStudyNotes, buffer);
  }

  private getPatientNameString(dicomData: TDicomData | undefined): string {
    return dicomData
      && dicomData[EDicomTag.PATIENT_NAME]?.Value
      && dicomData[EDicomTag.PATIENT_NAME]?.Value[0]
      && (dicomData[EDicomTag.PATIENT_NAME]?.Value[0] as { Alphabetic: string })?.Alphabetic
      ? (dicomData[EDicomTag.PATIENT_NAME]?.Value[0] as { Alphabetic: string })?.Alphabetic
      : DEFAULT_EMPTY_VALUE;
  }

  private getReferringPhysicianNameString(dicomData: TDicomData | undefined): string {
    return dicomData
    && dicomData[EDicomTag.REFERRING_PHYSICIAN_NAME]?.Value
    && dicomData[EDicomTag.REFERRING_PHYSICIAN_NAME]?.Value[0]
    && (dicomData[EDicomTag.REFERRING_PHYSICIAN_NAME]?.Value[0] as { Alphabetic: string })?.Alphabetic
      ? (dicomData[EDicomTag.REFERRING_PHYSICIAN_NAME]?.Value[0] as { Alphabetic: string })?.Alphabetic
      : DEFAULT_EMPTY_VALUE;
  }

  private getStringValue(dicomData: TDicomData | undefined, tag: EDicomTag) {
    return dicomData
    && dicomData[tag]?.Value
    && dicomData[tag]?.Value[0]
      ? dicomData[tag]?.Value[0] as string
      : DEFAULT_EMPTY_VALUE;
  }

  private getReferringPhysicianSequenceValue(dicomData: TDicomData | undefined, tag: EDicomTag) {
    return dicomData
      && (dicomData[EDicomTag.REFERRING_PHYSICIAN_IDENTIFICATION_SEQUENCE])?.Value
      && ((dicomData[EDicomTag.REFERRING_PHYSICIAN_IDENTIFICATION_SEQUENCE])?.Value[0] as TDicomData)?.[tag]
      && ((dicomData[EDicomTag.REFERRING_PHYSICIAN_IDENTIFICATION_SEQUENCE])?.Value[0] as TDicomData)?.[tag]?.Value
      && ((dicomData[EDicomTag.REFERRING_PHYSICIAN_IDENTIFICATION_SEQUENCE])?.Value[0] as TDicomData)?.[tag]?.Value[0]
      ? ((dicomData[EDicomTag.REFERRING_PHYSICIAN_IDENTIFICATION_SEQUENCE])?.Value[0] as TDicomData)?.[tag]?.Value[0] as string
      : DEFAULT_EMPTY_VALUE;
  }

  private getTaskId(payload: TSendStudyNotesPayload | TRequestStudyNotesPayload) {
    return crypto.createHash('sha1').update(JSON.stringify({ payload })).digest('hex');
  }

  private getStudyNotePath(payload: TSendStudyNotesPayload | TRequestStudyNotesPayload) {
    const taskId = this.getTaskId(payload);

    return path.join(this.agentPathService.getPathToTemp(), `${taskId}-study-notes.dcm`);
  }
}
