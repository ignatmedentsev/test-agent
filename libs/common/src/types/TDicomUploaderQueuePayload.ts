import type { IDicomItem } from '~common/interfaces';

export type TDicomUploaderQueuePayload = {
  item: IDicomItem,
  isPhiExists: boolean,
};

export type TAiDicomUploaderQueuePayload = {
  item: IDicomItem,
};
