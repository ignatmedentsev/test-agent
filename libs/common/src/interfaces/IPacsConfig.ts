export interface IPacsConfig {
  pacs: IPacsOptions;
}

export interface IPacsOptions {
  aet: string;
  port: number;
  storagePath: string;
  dicomProcessorItemDelay: number;

  scp: IScp;
}

export interface IScp {
  connectTimeout: number;
  associationTimeout: number;
  pduTimeout: number;
}
