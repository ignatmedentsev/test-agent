import type {
  EDicomModality,
  EDicomTag,
  EDicomVr,
  EDicomSpecificCharacterSet,
} from '~common/enums';
import type { IValueDicomElement } from '~common/interfaces';

import type { TDicomPatientSexCodeStringValue } from './TDicomPatientSexCodeStringValue';
import type { TDicomSingleMultiplicityStringValue } from './TDicomSingleMultiplicityStringValue';
import type { TDicomSingleMultiplicityValue } from './TDicomSingleMultiplicityValue';
import type { TDicomUniversalEntityIdValue } from './TDicomUniversalEntityIdValue';

type TDicomSpecificCharacterSetValue = TDicomSingleMultiplicityValue<`${EDicomSpecificCharacterSet}`>
type TDicomUIDString = string;
type TDicomSingleMultiplicityUidValue = TDicomSingleMultiplicityValue<TDicomUIDString>

type TDicomSingleMultiplicityPnValue = TDicomSingleMultiplicityValue<IValueDicomElement>;

type TDicomIntegerString = `${number}`;
type TDicomSingleMultiplicityIntegerStringValue = TDicomSingleMultiplicityValue<TDicomIntegerString>

type TDicomReferringPhysicianIdentificationSequenceValue = TDicomSingleMultiplicityValue<TDicomReferringPhysicianIdentificationSequence>

type TDicomIssuerOfAccessionNumberSequence = {
  [EDicomTag.LOCAL_NAMESPACE_ENTITY_ID]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.UNLIMITED_TEXT,
  },
  [EDicomTag.UNIVERSAL_ENTITY_ID]: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.UNLIMITED_TEXT,
  },
  [EDicomTag.UNIVERSAL_ENTITY_ID_TYPE]: {
    Value: TDicomUniversalEntityIdValue,
    vr: EDicomVr.CODE_STRING,
  },
} | {
  [EDicomTag.LOCAL_NAMESPACE_ENTITY_ID]: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.UNLIMITED_TEXT,
  },
}

type TDicomReferringPhysicianIdentificationSequence = {
  [EDicomTag.PERSON_ADDRESS]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.SHORT_TEXT,
  },
  [EDicomTag.REFERRING_PHYSICIAN_PHONE]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.PERSON_TELECOM_INFORMATION]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.LONG_TEXT,
  },
}

type TDicomIssuerOfAccessionNumberSequenceValue = TDicomSingleMultiplicityValue<TDicomIssuerOfAccessionNumberSequence>

type TDicomSingleMultiplicityModalityValue = TDicomSingleMultiplicityValue<`${EDicomModality}`>

export type TDicomPatchingData = {
  [EDicomTag.ISSUER_OF_PATIENT_ID]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.ADMITTING_DIAGNOSES_DESCRIPTION]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.SPECIFIC_CHARACTER_SET]?: {
    Value: TDicomSpecificCharacterSetValue,
    vr: EDicomVr.CODE_STRING,
  },
  [EDicomTag.SOP_INSTANCE_UID]?: {
    Value: TDicomSingleMultiplicityUidValue,
    vr: EDicomVr.UID,
  },
  [EDicomTag.STUDY_DATE]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.DATE_VR,
  },
  [EDicomTag.ACCESSION_NUMBER]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.ISSUER_OF_ACCESSION_NUMBER_SEQUENCE]?: {
    Value: TDicomIssuerOfAccessionNumberSequenceValue,
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.INSTITUTION_NAME]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.REFERRING_PHYSICIAN_NAME]?: {
    Value: TDicomSingleMultiplicityPnValue,
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.REFERRING_PHYSICIAN_IDENTIFICATION_SEQUENCE]?: {
    Value: TDicomReferringPhysicianIdentificationSequenceValue,
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.STUDY_DESCRIPTION]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.PATIENT_NAME]?: {
    Value: TDicomSingleMultiplicityPnValue,
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.PATIENT_ID]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.PATIENT_BIRTH_DATE]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.DATE_VR,
  },
  [EDicomTag.PATIENT_SEX]?: {
    Value: TDicomPatientSexCodeStringValue,
    vr: EDicomVr.CODE_STRING,
  },
  [EDicomTag.ADDITIONAL_PATIENT_HISTORY]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.BODY_PART_EXAMINED]?: {
    // TODO: Limit values according to https://dicom.nema.org/medical/dicom/current/output/chtml/part16/chapter_L.html#chapter_L ?
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.CODE_STRING,
  },

  [EDicomTag.STUDY_INSTANCE_UID]?: {
    Value: TDicomSingleMultiplicityUidValue,
    vr: EDicomVr.UID,
  },
  [EDicomTag.SERIES_INSTANCE_UID]?: {
    Value: TDicomSingleMultiplicityUidValue,
    vr: EDicomVr.UID,
  },
  [EDicomTag.STUDY_ID]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.SERIES_NUMBER]?: {
    Value: TDicomSingleMultiplicityIntegerStringValue,
    vr: EDicomVr.INTEGER_STRING,
  },
  [EDicomTag.SERIES_DESCRIPTION]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.CURRENT_PATIENT_LOCATION]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.INSTANCE_NUMBER]?: {
    Value: TDicomSingleMultiplicityIntegerStringValue,
    vr: EDicomVr.INTEGER_STRING,
  },
  [EDicomTag.REQUESTED_PROCEDURE_PRIORITY]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.REQUESTED_PROCEDURE_COMMENT]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.MODALITY]?: {
    Value: TDicomSingleMultiplicityModalityValue,
    vr: EDicomVr.CODE_STRING,
  },
  [EDicomTag.SERIES_DESCRIPTION]?: {
    Value: TDicomSingleMultiplicityStringValue,
    vr: EDicomVr.LONG_STRING,
  },
};
