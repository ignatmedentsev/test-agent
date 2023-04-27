import type { TDicomData } from '~common/types/TDicomData';

export class PhiDto {
  deviceToken: string;
  sopInstanceUid: string;
  studyInstanceUid: string;
  dicomData: TDicomData;
}

export class PhiPlatformDto {
  sopInstanceUid: string;
  dicomData: TDicomData;
}
