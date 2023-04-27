import type { IDicomItem } from '~common/interfaces';

export type TDicomUploaderQueuePayload = {
  item: IDicomItem,
  isPhiExists: boolean,
};
