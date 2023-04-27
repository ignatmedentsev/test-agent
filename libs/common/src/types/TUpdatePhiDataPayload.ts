export type TUpdatePhiDataPayload = {
  bodyPart: string,
  pacsFiles: TPacsFile[],
}

type TPacsFile = {
  sopInstanceUid: string,
  modalityCode?: string, /* (0008, 0060) */
  seriesNumber?: number, /* (0020, 0011) */
}
