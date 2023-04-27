import type { EOrganizationType, EScanDeviceType } from '../enums';

export interface IOrganizationInfo {
  autoRechargeAmount?: number;
  autoRechargeThreshold?: number;
  address: string;
  email: string;
  name: string;
  npi: string;
  shortName: string;
  contactFirstName: string;
  contactLastName: string;
  hasAddendumRequests?: boolean;
  phone?: string;
  type?: EOrganizationType;
  chiefId: number;
  id?: number;
  isAutoAcceptExam?: boolean;
  isAutoAcceptReport?: boolean;
  isAutoRechargeEnabled?: boolean;
  isAutoSendComparisons?: boolean;
  isAutoSendReportToPhysician?: boolean;
  isFilledRadiology?: boolean;
  isWalletPasswordProtected?: boolean;
  isMedcloudInternal?: boolean;
  inHouseRadiologistIds: number[];
  minBalanceNotification?: number;
  isRadiologyDocumentsRequiresAttention?: boolean;
  hasExamsFailedByLowBalance: boolean;
  timezone: string;
  hideDisputeExamButton: boolean;
  hasBillByRadRateCards: boolean;
  hasArcs: boolean;
  examPacsFilesFilledTimeoutMinutes: number;
  defaultScanDeviceType: EScanDeviceType;
}
