import type { IPacsFileInfo } from './IPacsFileInfo';
import type { IUids } from './IUids';

export interface IDicomItem {
  uids: IUids;
  callingAet: string;
  dicomFilePath?: string;
  error?: string;
  parsedDicom?: IPacsFileInfo;
  processingAttempts?: number;
  dicomBuffer?: Buffer;
}
