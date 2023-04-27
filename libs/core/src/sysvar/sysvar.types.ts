import type { ESysVarType } from '~common/enums/ESysVarType';

export type TRawToTypeConvertDictionary = {
  [key in ESysVarType]: {(value: string): any}
}

export type TTypeToRawConvertDictionary = {
  [key in ESysVarType]: {(value: any): string}
}
