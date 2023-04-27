import type { EExamPriority } from '~common/enums';

// Has a duplicate in the platform, keep consistent
export interface IPacsFileInfo {
  accessionIssuer: string;
  accessionNo: string;
  additionalPatientHistory: string;
  admittingDiagnosesDescription: string;
  aet: string;
  bodyPart: string;
  dob: string;
  history: string;
  imageOrientation: string;
  instanceNo: number;
  institutionName: string;
  isStudyNotes: boolean;
  issuerOfPatientId: string;
  localNamespaceEntityId: string;
  modality: string;
  numberOfFrames: number;
  originalPatientDob: string;
  originalPatientId: string;
  originalPatientName: string;
  originalPatientSex: string;
  originalRequestedProcedurePriority: string;
  path: string;
  patientAge: string;
  patientId: string;
  patientName: string;
  reasonForStudy: string;
  referencedSeriesInstanceUid?: string;
  referencedSopClassUid?: string;
  referencedSopInstanceUid?: string;
  referringPhysicianAddress: string;
  referringPhysicianEmail: string;
  referringPhysicianName: string;
  referringPhysicianPhone: string;
  rejectionState: number; // TODO: remove after switching from dcm4chee to our PACS server
  responsiblePerson: string;
  requestingPhysician: string;
  requestedProcedureComment: string;
  requestedProcedurePriority: EExamPriority;
  seriesDescription: string;
  seriesInstanceUid: string;
  seriesNo: number;
  sex: string;
  size: number;
  skipUpdateFilledPacsFiles?: boolean; // Skip updating the exam.filledPacsFiles field when receiving PACS files
  sliceThickness: string;
  sopUid: string;
  storage: string;
  studyComments: string;
  studyDate: string;
  studyDesc: string;
  studyId: string;
  studyUid: string;
  universalEntityIdType: string;
}

export interface IPacsFile {
  sopInstanceUid: string;
}
