import { Injectable } from '@nestjs/common';
import isEqual from 'lodash/isEqual';
import merge from 'lodash/merge';

import type { Phi } from '~agent/entity';
import { parseDateFromDicomTag } from '~agent/utils/date';
import { getPatientAge } from '~agent/utils/patient.utils';
import { EDicomTag } from '~common/enums';
import type { TDicomData, TSeriesData, TStudyData } from '~common/types';
import { PersonName } from '~common/utils/PersonName';
import { PersonNameNormalizer } from '~common/utils/PersonNameNormalizer';

const DEFAULT_EMPTY_VALUE = '-';

@Injectable()
export class StudyDataService {
  public generateStudyData(phiData: Phi[]) {
    const phiValues = phiData.map(phi => phi.dicomData);

    const result: TStudyData = {
      patientName: this.getPatientName(phiValues[0]),
      patientId: this.getStringValue(phiValues[0], EDicomTag.PATIENT_ID),
      patientDob: this.getDateValue(phiValues[0], EDicomTag.PATIENT_BIRTH_DATE),
      patientAge: this.getPatientAge(phiValues[0]),
      patientSex: this.getStringValue(phiValues[0], EDicomTag.PATIENT_SEX),
      institutionName: this.getStringValue(phiValues[0], EDicomTag.INSTITUTION_NAME),
      studyDate: this.getDateValue(phiValues[0], EDicomTag.STUDY_DATE),
      studyTime: this.getTimeValue(phiValues[0], EDicomTag.STUDY_TIME),
      studyDescription: this.getStringValue(phiValues[0], EDicomTag.STUDY_DESCRIPTION),
      protocolName: this.getStringValue(phiValues[0], EDicomTag.PROTOCOL_NAME),
      referringPhysicianName: this.getReferringPhysicianName(phiValues[0]),
      referringPhysicianMail: this.getReferringPhysicianSequenceValue(phiValues[0], EDicomTag.PERSON_TELECOM_INFORMATION),
      referringPhysicianPhone: this.getReferringPhysicianSequenceValue(phiValues[0], EDicomTag.REFERRING_PHYSICIAN_PHONE),
      additionalPatientHistory: this.getStringValue(phiValues[0], EDicomTag.ADDITIONAL_PATIENT_HISTORY),
      reasonForVisit: this.getStringValue(phiValues[0], EDicomTag.REASON_FOR_VISIT_ATTRIBUTE),
      series: this.getSeriesValues(phiValues),
    };

    return result;
  }

  private getPatientName(dicomData: TDicomData | undefined) {
    if (dicomData
      && dicomData[EDicomTag.PATIENT_NAME]
      && dicomData[EDicomTag.PATIENT_NAME]?.Value
      && dicomData[EDicomTag.PATIENT_NAME]?.Value.length
    ) {
      return this.getPersonName((dicomData[EDicomTag.PATIENT_NAME]?.Value[0] as { Alphabetic: string})?.Alphabetic);
    } else {
      return DEFAULT_EMPTY_VALUE;
    }
  }

  private getReferringPhysicianName(dicomData: TDicomData | undefined) {
    if (dicomData
      && dicomData[EDicomTag.REFERRING_PHYSICIAN_NAME]
      && dicomData[EDicomTag.REFERRING_PHYSICIAN_NAME]?.Value
      && dicomData[EDicomTag.REFERRING_PHYSICIAN_NAME]?.Value.length
    ) {
      return this.getPersonName((dicomData[EDicomTag.REFERRING_PHYSICIAN_NAME]?.Value[0] as { Alphabetic: string})?.Alphabetic);
    } else {
      return DEFAULT_EMPTY_VALUE;
    }
  }

  private getPersonName(rawValue: string) {
    if (!rawValue) {
      return DEFAULT_EMPTY_VALUE;
    }
    const normalizedPatientName = new PersonNameNormalizer(
      new PersonName(rawValue),
    ).normalize();

    let result = '';

    if (normalizedPatientName.getLastName()) {
      result = `${normalizedPatientName.getLastName()}`;
    }

    if (normalizedPatientName.getFirstName()) {
      result = result + `, ${normalizedPatientName.getFirstName()}`;
    }

    return result || DEFAULT_EMPTY_VALUE;
  }

  private getSeriesValues(phiValues: TDicomData[]) {
    const seriesData = phiValues.reduce((seriesMap, instanceData) => {
      const number = this.getStringValue(instanceData, EDicomTag.SERIES_NUMBER);
      const date = this.getDateValue(instanceData, EDicomTag.SERIES_DATE);
      const time = this.getTimeValue(instanceData, EDicomTag.SERIES_TIME);
      const modality = this.getStringValue(instanceData, EDicomTag.MODALITY);
      const bodyPart = this.getStringValue(instanceData, EDicomTag.BODY_PART_EXAMINED);
      const seriesInstanceUid = this.getStringValue(instanceData, EDicomTag.SERIES_INSTANCE_UID);
      const newSeriesData: TSeriesData = {
        number,
        date,
        time,
        modality,
        bodyPart,
      };
      if (!seriesMap.has(seriesInstanceUid)) {
        seriesMap.set(seriesInstanceUid, newSeriesData);
      } else {
        const savedSeriesData = seriesMap.get(seriesInstanceUid);
        if (!isEqual(newSeriesData, savedSeriesData)) {
          seriesMap.set(seriesInstanceUid, merge(newSeriesData, savedSeriesData));
        }
      }

      return seriesMap;
    }, new Map<string, TSeriesData>());

    return Array.from(seriesData.values())
      .sort((a, b) => {
        if (!a.number) {
          return -1;
        }
        if (!b.number) {
          return 1;
        }

        if (typeof a.number === 'number' && typeof b.number === 'number') {
          return a.number - b.number;
        }

        return String(a.number).localeCompare(String(b.number));
      });
  }

  private getTimeValue(dicomData: TDicomData | undefined, tag: EDicomTag) {
    if (dicomData
      && dicomData[tag]
      && dicomData[tag]?.Value
      && dicomData[tag]?.Value.length
    ) {
      const rawValue = dicomData[tag]?.Value[0] as string;
      if (!rawValue) {
        return DEFAULT_EMPTY_VALUE;
      }

      return this.formatDicomTime(rawValue);
    } else {
      return DEFAULT_EMPTY_VALUE;
    }
  }

  private getDateValue(dicomData: TDicomData | undefined, tag: EDicomTag) {
    if (dicomData
      && dicomData[tag]
      && dicomData[tag]?.Value
      && dicomData[tag]?.Value.length
    ) {
      const rawValue = dicomData[tag]?.Value[0] as string;
      if (!rawValue) {
        return DEFAULT_EMPTY_VALUE;
      }

      return this.formatDicomDate(rawValue);
    } else {
      return DEFAULT_EMPTY_VALUE;
    }
  }

  private getPatientAge(dicomData: TDicomData | undefined) {
    const dicomPatientDobString = dicomData
    && dicomData[EDicomTag.PATIENT_BIRTH_DATE]?.Value?.length
    && dicomData[EDicomTag.PATIENT_BIRTH_DATE]?.Value[0]
      ? dicomData[EDicomTag.PATIENT_BIRTH_DATE]?.Value[0] as string
      : null;

    const dicomDosString = dicomData && dicomData[EDicomTag.STUDY_DATE]?.Value?.length && dicomData[EDicomTag.STUDY_DATE]?.Value[0]
      ? dicomData[EDicomTag.STUDY_DATE]?.Value[0] as string
      : null;

    if (!dicomPatientDobString || !dicomDosString) {
      return DEFAULT_EMPTY_VALUE;
    }

    const patientDateOfBirth = parseDateFromDicomTag(dicomPatientDobString);
    const dateOfService = parseDateFromDicomTag(dicomDosString);

    if (!patientDateOfBirth || !dateOfService) {
      return DEFAULT_EMPTY_VALUE;
    }

    const patientAge = getPatientAge(patientDateOfBirth, dateOfService);

    return patientAge !== null && patientAge !== undefined && patientAge >= 0 ? patientAge.toString() : DEFAULT_EMPTY_VALUE;
  }

  private formatDicomTime(timeString: string) {
    const hh = timeString.substring(0, 2);
    const mm = timeString.substring(2, 4);
    const ss = timeString.substring(4, 6);

    return `${hh}:${mm}:${ss}`;
  }

  private formatDicomDate(dicomDateString: string) {
    const year = dicomDateString.substring(0, 4);
    const month = dicomDateString.substring(4, 6);
    const day = dicomDateString.substring(6, 8);

    return `${month}/${day}/${year}`;
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
}
