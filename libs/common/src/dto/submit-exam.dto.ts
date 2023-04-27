import type { IPacsFile, IScanSubmit } from '~common/interfaces';

export class SubmitExamDto {
  procedure?: string;
  studyInstanceUid: string;
  accessionNumber: string;
  accessionIssuer: string;
  pacsFiles?: IPacsFile[];

  isScan: boolean;
  scan: IScanSubmit;
}
