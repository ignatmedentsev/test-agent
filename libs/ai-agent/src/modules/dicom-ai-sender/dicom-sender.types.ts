import type { Client } from 'dcmjs-dimse';

// dmcjs-dimse has not actual types definition
export type TDcmjsScuOptions = Parameters<typeof Client.prototype.send>[4] & {datasetWriteOptions?: { fragmentMultiframe?: boolean} }

export type TAssociationRejectResult = {
  result?: number,
  source: number,
  reason: number,
};
