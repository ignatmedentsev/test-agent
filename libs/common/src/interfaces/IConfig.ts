
import type { EPacsFileUploaderType } from '~common/enums';

import type { TQueueOptions } from '../types/TQueueOptions';

import type { IHttpRetryOptions } from './IHttpRetryOptions';
import type { IPacsOptions } from './IPacsConfig';
import type { IStorescu } from './IStorescu';

export interface ICoreConfig {
  apiUrl: string;
  key?: string;
  pacs: IPacsOptions;
  storescu: IStorescu;
  httpRequestTimeout: number;
  httpsEnforced: boolean;
  pacsFileUploadProtocol: EPacsFileUploaderType;
  allowInsecureDimsePacsFileUpload: boolean;
  checkTlsTimeout: number;
  httpRetryOptions: IHttpRetryOptions;
  queueOptions?: TQueueOptions;
}
