import type { EScanStatusMapping } from '~common/enums';

export class UpdateStatusDto {
  deviceToken: string;
  studyInstanceUid: string;
  accessionIssuer: string;
  accessionNumber: string;
  status: EScanStatusMapping;
  errorMessage?: string;
}
