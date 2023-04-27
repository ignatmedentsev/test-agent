import type { RequestMethod } from '@nestjs/common';

export interface IApiOptions {
  // permissions: EPermission[];
  method: RequestMethod;
  external?: boolean;
  noLog?: boolean;
  singleRun?: ISingleRun;
  skipAuth?: boolean;
  systemAuth?: boolean;
  useTransaction?: boolean;
  maxResponseThreshold?: number;
}

interface ISingleRun {
  enabled: boolean;
  queued?: boolean;
  filteredParams?: string[];
}
