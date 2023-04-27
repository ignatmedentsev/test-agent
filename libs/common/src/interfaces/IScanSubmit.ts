import type { EScanDeviceType, EScanStatusMapping } from '~common/enums';

export interface IScanSubmit {
  deviceId: string;
  status?: EScanStatusMapping;
  errorMessage?: string;
  deviceType?: EScanDeviceType;
}
