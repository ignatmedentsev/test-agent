import { Injectable } from '@nestjs/common';
import type { DataSet } from 'dicom-parser';
import dicomParser from 'dicom-parser';

import { EDicomTag, EExamPriority } from '~common/enums';
import type { IDicomItem, IPacsFileInfo } from '~common/interfaces';
import { PersonName } from '~common/utils/PersonName';
import { PersonNameNormalizer } from '~common/utils/PersonNameNormalizer';

const PR_MODALITY = 'PR';
const EXAM_PRIORITY_MAPPING = new Map<string, EExamPriority>(
  [
    ['HIGH', EExamPriority.URGENT],
    ['LOW', EExamPriority.ROUTINE],
    ['MEDIUM', EExamPriority.ROUTINE],
    ['ROUTINE', EExamPriority.ROUTINE],
    ['STAT', EExamPriority.STAT],
  ],
);

// TODO: Same logic is used in FirePacs and platform and should be modified synchronously
@Injectable()
export class ParseDicomService {
  public parseDicom(item: IDicomItem) {
    if (!item.dicomBuffer) {
      throw new Error('DICOM Buffer does not exist and DICOM cannot be parsed');
    }

    const byteArray = new Uint8Array(item.dicomBuffer);
    const dataSet = dicomParser.parseDicom(byteArray);

    const normalizedPatientName = new PersonNameNormalizer(
      new PersonName(this.fetchDicomTag(dataSet, EDicomTag.PATIENT_NAME)),
    ).normalize();
    const normalizedReferringPhysicianName = new PersonNameNormalizer(
      new PersonName(this.fetchDicomTag(dataSet, EDicomTag.REFERRING_PHYSICIAN_NAME)),
    ).normalize();
    const modality = this.fetchDicomTag(dataSet, EDicomTag.MODALITY);

    const parsedDicom = {
      accessionIssuer: this.getTagFromSequence(dataSet, EDicomTag.ISSUER_OF_ACCESSION_NUMBER_SEQUENCE, 0, EDicomTag.UNIVERSAL_ENTITY_ID),
      accessionNo: this.fetchDicomTag(dataSet, EDicomTag.ACCESSION_NUMBER),
      additionalPatientHistory: this.fetchDicomTag(dataSet, EDicomTag.ADDITIONAL_PATIENT_HISTORY),
      reasonForStudy: this.fetchDicomTag(dataSet, EDicomTag.REASON_FOR_STUDY),
      studyComments: this.fetchDicomTag(dataSet, EDicomTag.STUDY_COMMENTS),
      admittingDiagnosesDescription: this.fetchDicomTag(dataSet, EDicomTag.ADMITTING_DIAGNOSES_DESCRIPTION),
      referringPhysicianName: this.parseNames(
        normalizedReferringPhysicianName.getLastName(),
        normalizedReferringPhysicianName.getFirstName(),
        normalizedReferringPhysicianName.getMiddleName(),
      ),
      referringPhysicianAddress: this.getTagFromSequence(
        dataSet,
        EDicomTag.REFERRING_PHYSICIAN_IDENTIFICATION_SEQUENCE,
        0,
        EDicomTag.PERSON_ADDRESS,
      ),
      referringPhysicianEmail: this.getTagFromSequence(
        dataSet,
        EDicomTag.REFERRING_PHYSICIAN_IDENTIFICATION_SEQUENCE,
        0,
        EDicomTag.PERSON_TELECOM_INFORMATION,
      ),
      referringPhysicianPhone: this.getTagFromSequence(
        dataSet,
        EDicomTag.REFERRING_PHYSICIAN_IDENTIFICATION_SEQUENCE,
        0,
        EDicomTag.REFERRING_PHYSICIAN_PHONE,
      ),
      requestedProcedureComment: this.fetchDicomTag(dataSet, EDicomTag.REQUESTED_PROCEDURE_COMMENT),
      aet: item.callingAet,
      responsiblePerson: this.fetchDicomTag(dataSet, EDicomTag.RESPONSIBLE_PERSON),
      requestingPhysician: this.fetchDicomTag(dataSet, EDicomTag.REQUESTING_PHYSICIAN),
      // Now the bodyPart is cut to 16 characters (according to DICOM format)
      bodyPart: this.fetchDicomTag(dataSet, EDicomTag.BODY_PART_EXAMINED),
      dob: this.extractPatientParam(this.fetchDicomTag(dataSet, EDicomTag.PATIENT_BIRTH_DATE)),
      history: this.fetchDicomTag(dataSet, EDicomTag.ADDITIONAL_PATIENT_HISTORY),
      imageOrientation: this.fetchDicomTag(dataSet, EDicomTag.IMAGE_ORIENTATION),
      instanceNo: Number(this.fetchDicomTag(dataSet, EDicomTag.INSTANCE_NUMBER)),
      institutionName: this.fetchDicomTag(dataSet, EDicomTag.INSTITUTION_NAME),
      modality,
      numberOfFrames: Number(this.fetchDicomTag(dataSet, EDicomTag.NUMBER_OF_FRAMES)),
      requestedProcedurePriority: this.extractRequestedProcedurePriority(this.fetchDicomTag(dataSet, EDicomTag.REQUESTED_PROCEDURE_PRIORITY)),
      issuerOfPatientId: this.fetchDicomTag(dataSet, EDicomTag.ISSUER_OF_PATIENT_ID),
      patientId: this.extractPatientParam(this.fetchDicomTag(dataSet, EDicomTag.PATIENT_ID)),
      patientName: this.parseNames(
        normalizedPatientName.getLastName(),
        normalizedPatientName.getFirstName(),
        normalizedPatientName.getMiddleName(),
      ),
      patientAge: this.fetchDicomTag(dataSet, EDicomTag.PATIENTS_AGE),
      seriesDescription: this.fetchDicomTag(dataSet, EDicomTag.SERIES_DESCRIPTION),
      seriesNo: Number(this.fetchDicomTag(dataSet, EDicomTag.SERIES_NUMBER)),
      seriesInstanceUid: item.uids?.seriesInstanceUID || this.fetchDicomTag(dataSet, EDicomTag.SERIES_INSTANCE_UID),
      sex: this.fetchDicomTag(dataSet, EDicomTag.PATIENT_SEX),
      size: item.dicomBuffer.byteLength,
      sliceThickness: this.fetchDicomTag(dataSet, EDicomTag.SLICE_THICKNESS),
      sopUid: item.uids?.sopInstanceUID || this.fetchDicomTag(dataSet, EDicomTag.SOP_INSTANCE_UID),
      storage: 'S3',
      studyId: this.fetchDicomTag(dataSet, EDicomTag.STUDY_ID),
      studyDate: this.fetchDicomTag(dataSet, EDicomTag.STUDY_DATE),
      studyDesc: this.fetchDicomTag(dataSet, EDicomTag.STUDY_DESCRIPTION),
      originalPatientId: this.fetchDicomTag(dataSet, EDicomTag.PATIENT_ID),
      originalPatientName: this.fetchDicomTag(dataSet, EDicomTag.PATIENT_NAME),
      originalPatientDob: this.fetchDicomTag(dataSet, EDicomTag.PATIENT_BIRTH_DATE),
      originalPatientSex: this.fetchDicomTag(dataSet, EDicomTag.PATIENT_SEX),
      originalRequestedProcedurePriority: this.fetchDicomTag(dataSet, EDicomTag.REQUESTED_PROCEDURE_PRIORITY),
      localNamespaceEntityId: this.getTagFromSequence(
        dataSet,
        EDicomTag.ISSUER_OF_ACCESSION_NUMBER_SEQUENCE,
        0,
        EDicomTag.LOCAL_NAMESPACE_ENTITY_ID,
      ),
      universalEntityIdType: this.getTagFromSequence(
        dataSet,
        EDicomTag.ISSUER_OF_ACCESSION_NUMBER_SEQUENCE,
        0,
        EDicomTag.UNIVERSAL_ENTITY_ID_TYPE,
      ),
      studyUid: item.uids?.studyInstanceUID || this.fetchDicomTag(dataSet, EDicomTag.STUDY_INSTANCE_UID),
    } as IPacsFileInfo;

    if (modality === PR_MODALITY) {
      const referencedSeriesSequence = this.getSequence(dataSet, EDicomTag.REFERENCED_SERIES_SEQUENCE);

      if (!referencedSeriesSequence) {
        return parsedDicom;
      }

      const elementDataSet = referencedSeriesSequence[0]?.dataSet;

      if (!elementDataSet) {
        return parsedDicom;
      }

      parsedDicom.referencedSeriesInstanceUid = this.fetchDicomTag(elementDataSet, EDicomTag.SERIES_INSTANCE_UID);
      parsedDicom.referencedSopInstanceUid = this.getTagFromSequence(
        elementDataSet,
        EDicomTag.REFERENCED_IMAGE_SEQUENCE,
        0,
        EDicomTag.REFERENCED_SOP_INSTANCE_UID,
      );
      parsedDicom.referencedSopClassUid = this.getTagFromSequence(
        elementDataSet,
        EDicomTag.REFERENCED_IMAGE_SEQUENCE,
        0,
        EDicomTag.REFERENCED_SOP_CLASS_UID,
      );
    }

    return parsedDicom;
  }

  private parseNames(nameLast?: string, nameFirst?: string, nameMiddle?: string) {
    const name = `${nameLast || ''}`
      + `${nameLast ? ',' : ''} `
      + `${nameFirst || ''} `
      + `${nameMiddle || ''}`
        .replace(/\s\s+/g, ' '); // removing double spaces;

    return name
      .trim()
      .replace(/,+$/, '');
  }

  private extractPatientParam(chunk: string) {
    if (typeof chunk !== 'string' || chunk.length === 0) {
      return;
    }

    // http://dicom.nema.org/dicom/2013/output/chtml/part05/sect_6.2.html
    // Allow all ASCII printable chars since we don't use ISO-IR 6
    const idAllowedChars = /^[\x20-\x7D,\x1B]$/;

    let idFiltered = '';

    for (const char of chunk) {
      if (!idAllowedChars.test(char)) {
        break;
      }
      idFiltered += char;
    }

    return idFiltered.trim();
  }

  private extractRequestedProcedurePriority(requestedProcedurePriorityRaw: string) {
    const valueFrom = requestedProcedurePriorityRaw?.toUpperCase();

    return EXAM_PRIORITY_MAPPING.get(valueFrom) || EExamPriority.ROUTINE;
  }

  private getSequence(dataSet: DataSet, sequence: EDicomTag) {
    return dataSet.elements[this.toDicomParserFormat(sequence)]?.items;
  }

  private getTagFromSequence(dataSet: DataSet, sequence: EDicomTag, elementNumber: number, tag: EDicomTag) {
    const elementItems = dataSet?.elements[this.toDicomParserFormat(sequence)]?.items;
    const elementDataSet = elementItems ? elementItems[elementNumber]?.dataSet : undefined;

    if (elementDataSet) {
      return this.fetchDicomTag(elementDataSet, tag);
    }

    return '';
  }

  private fetchDicomTag(dataSet: DataSet, tag: EDicomTag) {
    return dataSet.string(this.toDicomParserFormat(tag)) ?? '';
  }

  private toDicomParserFormat(value: EDicomTag) {
    return `x${value}`.toLowerCase();
  }
}
