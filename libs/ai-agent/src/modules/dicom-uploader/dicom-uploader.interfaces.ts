import type { IDicomItem } from '~common/interfaces';

export interface IPacsFileUploader {
  uploadPacsFile: (item: IDicomItem, isPhiExists: boolean) => Promise<void>;
}
