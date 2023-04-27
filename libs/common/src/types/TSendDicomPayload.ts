import type { IPacsServer } from '~common/interfaces';

export type TSendPlatformDicomPayload = {
  pacsServer: IPacsServer,
  examId: number,
  comparisonParentId: number,
  filePath: string,
  pacsFileId: number,
  aiDispatchId: number,
  aiReportId: number,
  scanId: number,
  forcePatchExamOnAgent: boolean,
  sopInstanceUid: string,
};

export type TSendLocalDicomPayload = {
  pacsServer: IPacsServer,
  examId: number,
  scanId: number,
  pacsFileId: number,
  studyInstanceUid: string,
  sopInstanceUid: string,
};
