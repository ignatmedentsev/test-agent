/* eslint-disable max-lines */
import { EDicomTag, EDicomVr } from '~common/enums';

type TDicomStandardTags = {
  [key in EDicomTag]: {
    keyword: string,
    vr: EDicomVr,
  };
};

export const dicomStandardTags: TDicomStandardTags = {
  [EDicomTag.TEXT_STRING]: {
    keyword: 'TextString',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.REFERENCED_FRAME_OF_REFERENCE_UID]: {
    keyword: 'ReferencedFrameOfReferenceUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.ARBITRARY]: {
    keyword: 'RETIRED_Arbitrary',
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.TEXT_COMMENTS]: {
    keyword: 'RETIRED_TextComments',
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.RESULTS_ID_ISSUER]: {
    keyword: 'RETIRED_ResultsIDIssuer',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.INTERPRETATION_RECORDER]: {
    keyword: 'RETIRED_InterpretationRecorder',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.INTERPRETATION_APPROVER_SEQUENCE]: {
    keyword: 'RETIRED_InterpretationApproverSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.PHYSICIAN_APPROVING_INTERPRETATION]: {
    keyword: 'RETIRED_PhysicianApprovingInterpretation',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.INTERPRETATION_DIAGNOSIS_DESCRIPTION]: {
    keyword: 'RETIRED_InterpretationDiagnosisDescription',
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.RESULTS_DISTRIBUTION_LIST_SEQUENCE]: {
    keyword: 'RETIRED_ResultsDistributionListSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.DISTRIBUTION_NAME]: {
    keyword: 'RETIRED_DistributionName',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.INTERPRETATION_ID_ISSUER]: {
    keyword: 'RETIRED_InterpretationIDIssuer',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.IMPRESSIONS]: {
    keyword: 'RETIRED_Impressions',
    vr: EDicomVr.SHORT_TEXT,
  },
  [EDicomTag.RESULTS_COMMENTS]: {
    keyword: 'RETIRED_ResultsComments',
    vr: EDicomVr.SHORT_TEXT,
  },
  [EDicomTag.CODING_SCHEME_DESIGNATOR]: {
    keyword: 'CodingSchemeDesignator',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.CODE_MEANING]: {
    keyword: 'CodeMeaning',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.TEXT_VALUE]: {
    keyword: 'TextValue',
    vr: EDicomVr.UNLIMITED_TEXT,
  },
  [EDicomTag.CODE_VALUE]: {
    keyword: 'CodeValue',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.CONCEPT_NAME_CODE_SEQUENCE]: {
    keyword: 'ConceptNameCodeSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.CONTENT_SEQUENCE]: {
    keyword: 'ContentSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.REQUESTED_PROCEDURE_PRIORITY]: {
    keyword: 'RequestedProcedurePriority',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.ISSUER_OF_PATIENT_ID]: {
    keyword: 'IssuerOfPatientID',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.BODY_PART_EXAMINED]: {
    keyword: 'BodyPartExamined',
    vr: EDicomVr.CODE_STRING,
  },
  [EDicomTag.SPECIFIC_CHARACTER_SET]: {
    keyword: 'SpecificCharacterSet',
    vr: EDicomVr.CODE_STRING,
  },
  [EDicomTag.STUDY_DATE]: {
    keyword: 'StudyDate',
    vr: EDicomVr.DATE_VR,
  },
  [EDicomTag.MODALITY]: {
    keyword: 'Modality',
    vr: EDicomVr.CODE_STRING,
  },
  [EDicomTag.STUDY_DESCRIPTION]: {
    keyword: 'StudyDescription',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.PATIENT_ID]: {
    keyword: 'PatientID',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.PATIENT_BIRTH_DATE]: {
    keyword: 'PatientBirthDate',
    vr: EDicomVr.DATE_VR,
  },
  [EDicomTag.PATIENT_SEX]: {
    keyword: 'PatientSex',
    vr: EDicomVr.CODE_STRING,
  },
  [EDicomTag.STUDY_INSTANCE_UID]: {
    keyword: 'StudyInstanceUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.ACCESSION_NUMBER]: {
    keyword: 'AccessionNumber',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.STUDY_ID]: {
    keyword: 'StudyID',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.SERIES_NUMBER]: {
    keyword: 'SeriesNumber',
    vr: EDicomVr.INTEGER_STRING,
  },
  [EDicomTag.SERIES_DESCRIPTION]: {
    keyword: 'SeriesDescription',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.SERIES_INSTANCE_UID]: {
    keyword: 'SeriesInstanceUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.INSTANCE_NUMBER]: {
    keyword: 'InstanceNumber',
    vr: EDicomVr.INTEGER_STRING,
  },
  [EDicomTag.SOP_CLASS_UID]: {
    keyword: 'SOPClassUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.SOP_INSTANCE_UID]: {
    keyword: 'SOPInstanceUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.PATIENT_NAME]: {
    keyword: 'PatientName',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.ISSUER_OF_ACCESSION_NUMBER_SEQUENCE]: {
    keyword: 'IssuerOfAccessionNumberSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.LOCAL_NAMESPACE_ENTITY_ID]: {
    keyword: 'LocalNamespaceEntityID',
    vr: EDicomVr.UNLIMITED_TEXT,
  },
  [EDicomTag.UNIVERSAL_ENTITY_ID]: {
    keyword: 'UniversalEntityID',
    vr: EDicomVr.UNLIMITED_TEXT,
  },
  [EDicomTag.UNIVERSAL_ENTITY_ID_TYPE]: {
    keyword: 'UniversalEntityIDType',
    vr: EDicomVr.CODE_STRING,
  },
  [EDicomTag.INSTITUTION_NAME]: {
    keyword: 'InstitutionName',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.ADDITIONAL_PATIENT_HISTORY]: {
    keyword: 'AdditionalPatientHistory',
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.REASON_FOR_STUDY]: {
    keyword: 'RETIRED_ReasonForStudy',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.STUDY_COMMENTS]: {
    keyword: 'RETIRED_StudyComments',
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.ADMITTING_DIAGNOSES_DESCRIPTION]: {
    keyword: 'AdmittingDiagnosesDescription',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.CURRENT_PATIENT_LOCATION]: {
    keyword: 'CurrentPatientLocation',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.REFERRING_PHYSICIAN_IDENTIFICATION_SEQUENCE]: {
    keyword: 'ReferringPhysicianIdentificationSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.PERSON_ADDRESS]: {
    keyword: 'PersonAddress',
    vr: EDicomVr.SHORT_TEXT,
  },
  [EDicomTag.PERSON_TELECOM_INFORMATION]: {
    keyword: 'PersonTelecomInformation',
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.REFERRING_PHYSICIAN_NAME]: {
    keyword: 'ReferringPhysicianName',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.REFERRING_PHYSICIAN_PHONE]: {
    keyword: 'PersonTelephoneNumbers',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.REQUESTED_PROCEDURE_COMMENT]: {
    keyword: 'RequestedProcedureComments',
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.AE_TITLE]: {
    keyword: 'RetrieveAETitle',
    vr: EDicomVr.APPLICATION_ENTITY,
  },
  [EDicomTag.IMAGE_ORIENTATION]: {
    keyword: 'ImageOrientationPatient',
    vr: EDicomVr.DECIMAL,
  },
  [EDicomTag.NUMBER_OF_FRAMES]: {
    keyword: 'NumberOfFrames',
    vr: EDicomVr.INTEGER_STRING,
  },
  [EDicomTag.SLICE_THICKNESS]: {
    keyword: 'SliceThickness',
    vr: EDicomVr.DECIMAL,
  },
  [EDicomTag.STUDY_TIME]: {
    keyword: 'StudyTime',
    vr: EDicomVr.TIME,
  },
  [EDicomTag.VISIT_STATUS_ID]: {
    keyword: 'VisitStatusID',
    vr: EDicomVr.CODE_STRING,
  },
  [EDicomTag.ACQUISITION_COMMENTS]: {
    keyword: 'RETIRED_AcquisitionComments',
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.ACQUISITION_CONTEXT_SEQUENCE]: {
    keyword: 'AcquisitionContextSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.ACQUISITION_DATE]: {
    keyword: 'AcquisitionDate',
    vr: EDicomVr.DATE_VR,
  },
  [EDicomTag.ACQUISITION_DATETIME]: {
    keyword: 'AcquisitionDateTime',
    vr: EDicomVr.DATE_TIME,
  },
  [EDicomTag.ACQUISITION_DEVICE_PROCESSING_DESCRIPTION]: {
    keyword: 'AcquisitionDeviceProcessingDescription',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.ACQUISITION_PROTOCOL_DESCRIPTION]: {
    keyword: 'AcquisitionProtocolDescription',
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.ACQUISITION_TIME]: {
    keyword: 'AcquisitionTime',
    vr: EDicomVr.TIME,
  },
  [EDicomTag.ACTUAL_HUMAN_PERFORMERS_SEQUENCE]: {
    keyword: 'ActualHumanPerformersSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.ADMISSION_ID]: {
    keyword: 'AdmissionID',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.ADMITTING_DATE]: {
    keyword: 'AdmittingDate',
    vr: EDicomVr.DATE_VR,
  },
  [EDicomTag.ADMITTING_DIAGNOSES_CODE_SEQUENCE]: {
    keyword: 'AdmittingDiagnosesCodeSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.ADMITTING_TIME]: {
    keyword: 'AdmittingTime',
    vr: EDicomVr.TIME,
  },
  [EDicomTag.AFFECTED_SOP_INSTANCE_UID]: {
    keyword: 'AffectedSOPInstanceUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.ALLERGIES]: {
    keyword: 'Allergies',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.AUTHOR_OBSERVER_SEQUENCE]: {
    keyword: 'AuthorObserverSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.BRANCH_OF_SERVICE]: {
    keyword: 'BranchOfService',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.CASSETTE_ID]: {
    keyword: 'CassetteID',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.COMMENTS_ON_THE_PERFORMED_PROCEDURE_STEP]: {
    keyword: 'CommentsOnThePerformedProcedureStep',
    vr: EDicomVr.SHORT_TEXT,
  },
  [EDicomTag.CONCATENATION_UID]: {
    keyword: 'ConcatenationUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.CONFIDENTIALITY_CONSTRAINT_ON_PATIENT_DATA_DESCRIPTION]: {
    keyword: 'ConfidentialityConstraintOnPatientDataDescription',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.CONTENT_CREATORS_IDENTIFICATION_CODE_SEQUENCE]: {
    keyword: 'ContentCreatorIdentificationCodeSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.CONTENT_CREATORS_NAME]: {
    keyword: 'ContentCreatorName',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.CONTENT_DATE]: {
    keyword: 'ContentDate',
    vr: EDicomVr.DATE_VR,
  },
  [EDicomTag.CONTENT_TIME]: {
    keyword: 'ContentTime',
    vr: EDicomVr.TIME,
  },
  [EDicomTag.CONTEXT_GROUP_EXTENSION_CREATOR_UID]: {
    keyword: 'ContextGroupExtensionCreatorUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.CONTRAST_BOLUS_AGENT]: {
    keyword: 'ContrastBolusAgent',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.CONTRIBUTION_DESCRIPTION]: {
    keyword: 'ContributionDescription',
    vr: EDicomVr.SHORT_TEXT,
  },
  [EDicomTag.COUNTRY_OF_RESIDENCE]: {
    keyword: 'CountryOfResidence',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.CREATOR_VERSION_UID]: {
    keyword: 'CreatorVersionUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.CURVE_DATE]: {
    keyword: 'RETIRED_CurveDate',
    vr: EDicomVr.DATE_VR,
  },
  [EDicomTag.CURVE_TIME]: {
    keyword: 'RETIRED_CurveTime',
    vr: EDicomVr.TIME,
  },
  [EDicomTag.CUSTODIAL_ORGANIZATION_SEQUENCE]: {
    keyword: 'CustodialOrganizationSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.DATA_SET_TRAILING_PADDING]: {
    keyword: 'DataSetTrailingPadding',
    vr: EDicomVr.OTHER_BYTE_STRING,
  },
  [EDicomTag.DERIVATION_DESCRIPTION]: {
    keyword: 'DerivationDescription',
    vr: EDicomVr.SHORT_TEXT,
  },
  [EDicomTag.DETECTOR_ID]: {
    keyword: 'DetectorID',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.DEVICE_SERIAL_NUMBER]: {
    keyword: 'DeviceSerialNumber',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.DEVICE_UID]: {
    keyword: 'DeviceUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.DIGITAL_SIGNATURES_SEQUENCE]: {
    keyword: 'DigitalSignaturesSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.DIGITAL_SIGNATURE_UID]: {
    keyword: 'DigitalSignatureUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.DIMENSION_ORGANIZATION_UID]: {
    keyword: 'DimensionOrganizationUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.DISCHARGE_DIAGNOSIS_DESCRIPTION]: {
    keyword: 'RETIRED_DischargeDiagnosisDescription',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.DISTRIBUTION_ADDRESS]: {
    keyword: 'RETIRED_DistributionAddress',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.DOSE_REFERENCE_UID]: {
    keyword: 'DoseReferenceUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.ETHNIC_GROUP]: {
    keyword: 'EthnicGroup',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.FAILED_SOP_INSTANCE_UID_LIST]: {
    keyword: 'FailedSOPInstanceUIDList',
    vr: EDicomVr.UID,
  },
  [EDicomTag.FIDUCIAL_UID]: {
    keyword: 'FiducialUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.FILLER_ORDER_NUMBER_IMAGING_SERVICE_REQUEST]: {
    keyword: 'FillerOrderNumberImagingServiceRequest',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.FRAME_COMMENTS]: {
    keyword: 'FrameComments',
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.FRAME_OF_REFERENCE_UID]: {
    keyword: 'FrameOfReferenceUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.GANTRY_ID]: {
    keyword: 'GantryID',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.GENERATOR_ID]: {
    keyword: 'GeneratorID',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.GRAPHIC_ANNOTATION_SEQUENCE]: {
    keyword: 'GraphicAnnotationSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.HUMAN_PERFORMERS_NAME]: {
    keyword: 'HumanPerformerName',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.HUMAN_PERFORMERS_ORGANIZATION]: {
    keyword: 'HumanPerformerOrganization',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.ICON_IMAGE_SEQUENCE]: {
    keyword: 'IconImageSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.IDENTIFYING_COMMENTS]: {
    keyword: 'RETIRED_IdentifyingComments',
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.IMAGE_COMMENTS]: {
    keyword: 'ImageComments',
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.IMAGE_PRESENTATION_COMMENTS]: {
    keyword: 'RETIRED_ImagePresentationComments',
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.IMAGING_SERVICE_REQUEST_COMMENTS]: {
    keyword: 'ImagingServiceRequestComments',
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.INSTANCE_CREATOR_UID]: {
    keyword: 'InstanceCreatorUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.INSTITUTIONAL_DEPARTMENT_NAME]: {
    keyword: 'InstitutionalDepartmentName',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.INSTITUTION_ADDRESS]: {
    keyword: 'InstitutionAddress',
    vr: EDicomVr.SHORT_TEXT,
  },
  [EDicomTag.INSTITUTION_CODE_SEQUENCE]: {
    keyword: 'InstitutionCodeSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.INSURANCE_PLAN_IDENTIFICATION]: {
    keyword: 'RETIRED_InsurancePlanIdentification',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.INTENDED_RECIPIENTS_OF_RESULTS_IDENTIFICATION_SEQUENCE]: {
    keyword: 'IntendedRecipientsOfResultsIdentificationSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.INTERPRETATION_AUTHOR]: {
    keyword: 'RETIRED_InterpretationAuthor',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.INTERPRETATION_TEXT]: {
    keyword: 'RETIRED_InterpretationText',
    vr: EDicomVr.SHORT_TEXT,
  },
  [EDicomTag.INTERPRETATION_TRANSCRIBER]: {
    keyword: 'RETIRED_InterpretationTranscriber',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.IRRADIATION_EVENT_UID]: {
    keyword: 'IrradiationEventUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.ISSUER_OF_ADMISSION_ID]: {
    keyword: 'RETIRED_IssuerOfAdmissionID',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.ISSUER_OF_SERVICE_EPISODE_ID]: {
    keyword: 'RETIRED_IssuerOfServiceEpisodeID',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.LARGE_PALETTE_COLOR_LOOKUP_TABLE_UID]: {
    keyword: 'RETIRED_LargePaletteColorLookupTableUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.LAST_MENSTRUAL_DATE]: {
    keyword: 'LastMenstrualDate',
    vr: EDicomVr.DATE_VR,
  },
  [EDicomTag.MAC]: {
    keyword: 'MAC',
    vr: EDicomVr.OTHER_BYTE_STRING,
  },
  [EDicomTag.MEDIA_STORAGE_SOP_INSTANCE_UID]: {
    keyword: 'MediaStorageSOPInstanceUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.MEDICAL_ALERTS]: {
    keyword: 'MedicalAlerts',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.MEDICAL_RECORD_LOCATOR]: {
    keyword: 'MedicalRecordLocator',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.MILITARY_RANK]: {
    keyword: 'MilitaryRank',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.MODIFIED_ATTRIBUTES_SEQUENCE]: {
    keyword: 'ModifiedAttributesSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.MODIFIED_IMAGE_DESCRIPTION]: {
    keyword: 'RETIRED_ModifiedImageDescription',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.MODIFYING_DEVICE_ID]: {
    keyword: 'RETIRED_ModifyingDeviceID',
    vr: EDicomVr.CODE_STRING,
  },
  [EDicomTag.MODIFYING_DEVICE_MANUFACTURER]: {
    keyword: 'RETIRED_ModifyingDeviceManufacturer',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.NAMES_OF_INTENDED_RECIPIENT_OF_RESULTS]: {
    keyword: 'NamesOfIntendedRecipientsOfResults',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.NAME_OF_PHYSICIAN_READING_STUDY]: {
    keyword: 'NameOfPhysiciansReadingStudy',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.OCCUPATION]: {
    keyword: 'Occupation',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.OPERATORS_IDENTIFICATION_SEQUENCE]: {
    keyword: 'OperatorIdentificationSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.OPERATORS_NAME]: {
    keyword: 'OperatorsName',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.ORDER_CALLBACK_PHONE_NUMBER]: {
    keyword: 'OrderCallbackPhoneNumber',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.ORDER_ENTERED_BY]: {
    keyword: 'OrderEnteredBy',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.ORDER_ENTERER_LOCATION]: {
    keyword: 'OrderEntererLocation',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.ORIGINAL_ATTRIBUTES_SEQUENCE]: {
    keyword: 'OriginalAttributesSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.OTHER_PATIENT_IDS]: {
    keyword: 'OtherPatientIDs',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.OTHER_PATIENT_IDS_SEQUENCE]: {
    keyword: 'OtherPatientIDsSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.OTHER_PATIENT_NAMES]: {
    keyword: 'OtherPatientNames',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.OVERLAY_DATE]: {
    keyword: 'RETIRED_OverlayDate',
    vr: EDicomVr.DATE_VR,
  },
  [EDicomTag.OVERLAY_TIME]: {
    keyword: 'RETIRED_OverlayTime',
    vr: EDicomVr.TIME,
  },
  [EDicomTag.PALETTE_COLOR_LOOKUP_TABLE_UID]: {
    keyword: 'PaletteColorLookupTableUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.PARTICIPANT_SEQUENCE]: {
    keyword: 'ParticipantSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.PATIENTS_AGE]: {
    keyword: 'PatientAge',
    vr: EDicomVr.AGE_STRING,
  },
  [EDicomTag.PATIENTS_BIRTH_NAME]: {
    keyword: 'PatientBirthName',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.PATIENTS_BIRTH_TIME]: {
    keyword: 'PatientBirthTime',
    vr: EDicomVr.TIME,
  },
  [EDicomTag.PATIENTS_INSTITUTION_RESIDENCE]: {
    keyword: 'PatientInstitutionResidence',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.PATIENTS_INSURANCE_PLAN_CODE_SEQUENCE]: {
    keyword: 'PatientInsurancePlanCodeSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.PATIENTS_MOTHERS_BIRTH_NAME]: {
    keyword: 'PatientMotherBirthName',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.PATIENTS_PRIMARY_LANGUAGE_CODE_SEQUENCE]: {
    keyword: 'PatientPrimaryLanguageCodeSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.PATIENTS_PRIMARY_LANGUAGE_MODIFIER_CODE_SEQUENCE]: {
    keyword: 'PatientPrimaryLanguageModifierCodeSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.PATIENTS_RELIGIOUS_PREFERENCE]: {
    keyword: 'PatientReligiousPreference',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.PATIENTS_SIZE]: {
    keyword: 'PatientSize',
    vr: EDicomVr.DECIMAL,
  },
  [EDicomTag.PATIENTS_TELEPHONE_NUMBERS]: {
    keyword: 'PatientTelephoneNumbers',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.PATIENTS_WEIGHT]: {
    keyword: 'PatientWeight',
    vr: EDicomVr.DECIMAL,
  },
  [EDicomTag.PATIENT_ADDRESS]: {
    keyword: 'PatientAddress',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.PATIENT_COMMENTS]: {
    keyword: 'PatientComments',
    vr: EDicomVr.LONG_TEXT,
  },
  [EDicomTag.PATIENT_SEX_NEUTERED]: {
    keyword: 'PatientSexNeutered',
    vr: EDicomVr.CODE_STRING,
  },
  [EDicomTag.PATIENT_STATE]: {
    keyword: 'PatientState',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.PATIENT_TRANSPORT_ARRANGEMENTS]: {
    keyword: 'PatientTransportArrangements',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.PERFORMED_LOCATION]: {
    keyword: 'PerformedLocation',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.PERFORMED_PROCEDURE_STEP_DESCRIPTION]: {
    keyword: 'PerformedProcedureStepDescription',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.PERFORMED_PROCEDURE_STEP_END_DATE]: {
    keyword: 'PerformedProcedureStepEndDate',
    vr: EDicomVr.DATE_VR,
  },
  [EDicomTag.PERFORMED_PROCEDURE_STEP_END_TIME]: {
    keyword: 'PerformedProcedureStepEndTime',
    vr: EDicomVr.TIME,
  },
  [EDicomTag.PERFORMED_PROCEDURE_STEP_ID]: {
    keyword: 'PerformedProcedureStepID',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.PERFORMED_PROCEDURE_STEP_START_DATE]: {
    keyword: 'PerformedProcedureStepStartDate',
    vr: EDicomVr.DATE_VR,
  },
  [EDicomTag.PERFORMED_PROCEDURE_STEP_START_TIME]: {
    keyword: 'PerformedProcedureStepStartTime',
    vr: EDicomVr.TIME,
  },
  [EDicomTag.PERFORMED_STATION_AE_TITLE]: {
    keyword: 'PerformedStationAETitle',
    vr: EDicomVr.APPLICATION_ENTITY,
  },
  [EDicomTag.PERFORMED_STATION_GEOGRAPHIC_LOCATION_CODE_SEQUENCE]: {
    keyword: 'PerformedStationGeographicLocationCodeSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.PERFORMED_STATION_NAME]: {
    keyword: 'PerformedStationName',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.PERFORMING_PHYSICIANS_NAME]: {
    keyword: 'PerformingPhysicianName',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.PERFORMING_PHYSICIAN_IDENTIFICATION_SEQUENCE]: {
    keyword: 'PerformingPhysicianIdentificationSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.PERSON_IDENTIFICATION_CODE_SEQUENCE]: {
    keyword: 'PersonIdentificationCodeSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.PERSON_NAME]: {
    keyword: 'PersonName',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.PHYSICIAN_OF_RECORD]: {
    keyword: 'PhysiciansOfRecord',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.PHYSICIAN_OF_RECORD_IDENTIFICATION_SEQUENCE]: {
    keyword: 'PhysiciansOfRecordIdentificationSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.PHYSICIAN_READING_STUDY_IDENTIFICATION_SEQUENCE]: {
    keyword: 'PhysiciansReadingStudyIdentificationSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.PLACER_ORDER_NUMBER_IMAGING_SERVICE_REQUEST]: {
    keyword: 'PlacerOrderNumberImagingServiceRequest',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.PLATE_ID]: {
    keyword: 'PlateID',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.PREGNANCY_STATUS]: {
    keyword: 'PregnancyStatus',
    vr: EDicomVr.UNSIGNED_SHORT,
  },
  [EDicomTag.PREMEDICATION]: {
    keyword: 'PreMedication',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.PROTOCOL_NAME]: {
    keyword: 'ProtocolName',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.REASON_FOR_THE_IMAGING_SERVICE_REQUEST]: {
    keyword: 'RETIRED_ReasonForTheImagingServiceRequest',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.REASON_FOR_VISIT_ATTRIBUTE]: {
    keyword: 'ReasonForVisit',
    vr: EDicomVr.UNLIMITED_TEXT,
  },
  [EDicomTag.REFERENCED_DIGITAL_SIGNATURE_SEQUENCE]: {
    keyword: 'ReferencedDigitalSignatureSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.REFERENCED_GENERAL_PURPOSE_SCHEDULED_PROCEDURE_STEP_TRANSACTION_UID]: {
    keyword: 'RETIRED_ReferencedGeneralPurposeScheduledProcedureStepTransactionUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.REFERENCED_IMAGE_SEQUENCE]: {
    keyword: 'ReferencedImageSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.REFERENCED_PATIENT_SEQUENCE]: {
    keyword: 'ReferencedPatientSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.REFERENCED_PERFORMED_PROCEDURE_STEP_SEQUENCE]: {
    keyword: 'ReferencedPerformedProcedureStepSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.REFERENCED_SOP_INSTANCE_MAC_SEQUENCE]: {
    keyword: 'ReferencedSOPInstanceMACSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.REFERENCED_SOP_INSTANCE_UID]: {
    keyword: 'ReferencedSOPInstanceUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.REFERENCED_SOP_INSTANCE_UID_IN_FILE]: {
    keyword: 'ReferencedSOPInstanceUIDInFile',
    vr: EDicomVr.UID,
  },
  [EDicomTag.REFERENCED_STUDY_SEQUENCE]: {
    keyword: 'ReferencedStudySequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.REFERRING_PHYSICIAN_ADDRESS]: {
    keyword: 'ReferringPhysicianAddress',
    vr: EDicomVr.SHORT_TEXT,
  },
  [EDicomTag.REFERRING_PHYSICIAN_TELEPHONE_NUMBERS]: {
    keyword: 'ReferringPhysicianTelephoneNumbers',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.REGION_OF_RESIDENCE]: {
    keyword: 'RegionOfResidence',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.RELATED_FRAME_OF_REFERENCE_UID]: {
    keyword: 'RETIRED_RelatedFrameOfReferenceUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.REQUESTED_CONTRAST_AGENT]: {
    keyword: 'RequestedContrastAgent',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.REQUESTED_PROCEDURE_DESCRIPTION]: {
    keyword: 'RequestedProcedureDescription',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.REQUESTED_PROCEDURE_ID]: {
    keyword: 'RequestedProcedureID',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.REQUESTED_PROCEDURE_LOCATION]: {
    keyword: 'RequestedProcedureLocation',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.REFERENCED_SOP_CLASS_UID]: {
    keyword: 'ReferencedSOPClassUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.REFERENCED_SERIES_SEQUENCE]: {
    keyword: 'ReferencedSeriesSequence',
    vr: EDicomVr.UID,
  },
  [EDicomTag.REQUESTED_SOP_INSTANCE_UID]: {
    keyword: 'RequestedSOPInstanceUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.REQUESTING_PHYSICIAN]: {
    keyword: 'RequestingPhysician',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.REQUESTING_SERVICE]: {
    keyword: 'RequestingService',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.REQUEST_ATTRIBUTES_SEQUENCE]: {
    keyword: 'RequestAttributesSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.RESPONSIBLE_ORGANIZATION]: {
    keyword: 'ResponsibleOrganization',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.RESPONSIBLE_PERSON]: {
    keyword: 'ResponsiblePerson',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.REVIEWER_NAME]: {
    keyword: 'ReviewerName',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.SCHEDULED_HUMAN_PERFORMERS_SEQUENCE]: {
    keyword: 'ScheduledHumanPerformersSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.SCHEDULED_PATIENT_INSTITUTION_RESIDENCE]: {
    keyword: 'RETIRED_ScheduledPatientInstitutionResidence',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.SCHEDULED_PERFORMING_PHYSICIAN_IDENTIFICATION_SEQUENCE]: {
    keyword: 'ScheduledPerformingPhysicianIdentificationSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.SCHEDULED_PERFORMING_PHYSICIAN_NAME]: {
    keyword: 'ScheduledPerformingPhysicianName',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.SCHEDULED_PROCEDURE_STEP_DESCRIPTION]: {
    keyword: 'ScheduledProcedureStepDescription',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.SCHEDULED_PROCEDURE_STEP_END_DATE]: {
    keyword: 'ScheduledProcedureStepEndDate',
    vr: EDicomVr.DATE_VR,
  },
  [EDicomTag.SCHEDULED_PROCEDURE_STEP_END_TIME]: {
    keyword: 'ScheduledProcedureStepEndTime',
    vr: EDicomVr.TIME,
  },
  [EDicomTag.SCHEDULED_PROCEDURE_STEP_LOCATION]: {
    keyword: 'ScheduledProcedureStepLocation',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.SCHEDULED_PROCEDURE_STEP_START_DATE]: {
    keyword: 'ScheduledProcedureStepStartDate',
    vr: EDicomVr.DATE_VR,
  },
  [EDicomTag.SCHEDULED_PROCEDURE_STEP_START_TIME]: {
    keyword: 'ScheduledProcedureStepStartTime',
    vr: EDicomVr.TIME,
  },
  [EDicomTag.SCHEDULED_STATION_AE_TITLE]: {
    keyword: 'ScheduledStationAETitle',
    vr: EDicomVr.APPLICATION_ENTITY,
  },
  [EDicomTag.SCHEDULED_STATION_GEOGRAPHIC_LOCATION_CODE_SEQUENCE]: {
    keyword: 'ScheduledStationGeographicLocationCodeSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.SCHEDULED_STATION_NAME]: {
    keyword: 'ScheduledStationName',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.SCHEDULED_STATION_NAME_CODE_SEQUENCE]: {
    keyword: 'ScheduledStationNameCodeSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.SCHEDULED_STUDY_LOCATION]: {
    keyword: 'RETIRED_ScheduledStudyLocation',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.SCHEDULED_STUDY_LOCATION_AE_TITLE]: {
    keyword: 'RETIRED_ScheduledStudyLocationAETitle',
    vr: EDicomVr.APPLICATION_ENTITY,
  },
  [EDicomTag.SERIES_DATE]: {
    keyword: 'SeriesDate',
    vr: EDicomVr.DATE_VR,
  },
  [EDicomTag.SERIES_TIME]: {
    keyword: 'SeriesTime',
    vr: EDicomVr.TIME,
  },
  [EDicomTag.SERVICE_EPISODE_DESCRIPTION]: {
    keyword: 'ServiceEpisodeDescription',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.SERVICE_EPISODE_ID]: {
    keyword: 'ServiceEpisodeID',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.SMOKING_STATUS]: {
    keyword: 'SmokingStatus',
    vr: EDicomVr.CODE_STRING,
  },
  [EDicomTag.SOURCE_IMAGE_SEQUENCE]: {
    keyword: 'SourceImageSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.SPECIAL_NEEDS]: {
    keyword: 'SpecialNeeds',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.STATION_NAME]: {
    keyword: 'StationName',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.STORAGE_MEDIA_FILESET_UID]: {
    keyword: 'StorageMediaFileSetUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.STUDY_ID_ISSUER]: {
    keyword: 'RETIRED_StudyIDIssuer',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.SYNCHRONIZATION_FRAME_OF_REFERENCE_UID]: {
    keyword: 'SynchronizationFrameOfReferenceUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.TEMPLATE_EXTENSION_CREATOR_UID]: {
    keyword: 'RETIRED_TemplateExtensionCreatorUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.TEMPLATE_EXTENSION_ORGANIZATION_UID]: {
    keyword: 'RETIRED_TemplateExtensionOrganizationUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.TIMEZONE_OFFSET_FROM_UTC]: {
    keyword: 'TimezoneOffsetFromUTC',
    vr: EDicomVr.SHORT_STRING,
  },
  [EDicomTag.TOPIC_AUTHOR]: {
    keyword: 'RETIRED_TopicAuthor',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.TOPIC_KEYWORDS]: {
    keyword: 'RETIRED_TopicKeywords',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.TOPIC_SUBJECT]: {
    keyword: 'RETIRED_TopicSubject',
    vr: EDicomVr.SHORT_TEXT,
  },
  [EDicomTag.TOPIC_TITLE]: {
    keyword: 'RETIRED_TopicTitle',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.TRANSACTION_UID]: {
    keyword: 'TransactionUID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.UID]: {
    keyword: 'UID',
    vr: EDicomVr.UID,
  },
  [EDicomTag.VERIFYING_OBSERVER_IDENTIFICATION_CODE_SEQUENCE]: {
    keyword: 'VerifyingObserverIdentificationCodeSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.VERIFYING_OBSERVER_NAME]: {
    keyword: 'VerifyingObserverName',
    vr: EDicomVr.PERSON_NAME,
  },
  [EDicomTag.VERIFYING_OBSERVER_SEQUENCE]: {
    keyword: 'VerifyingObserverSequence',
    vr: EDicomVr.SEQUENCE,
  },
  [EDicomTag.VERIFYING_ORGANIZATION]: {
    keyword: 'VerifyingOrganization',
    vr: EDicomVr.LONG_STRING,
  },
  [EDicomTag.VISIT_COMMENTS]: {
    keyword: 'VisitComments',
    vr: EDicomVr.LONG_TEXT,
  },
};
