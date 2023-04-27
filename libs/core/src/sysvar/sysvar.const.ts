import { ESysVarType } from '~common/enums';

import type { TRawToTypeConvertDictionary, TTypeToRawConvertDictionary } from './sysvar.types';

export const SYS_VAR_RAW_TO_TYPE_FUNCTIONS: TRawToTypeConvertDictionary = {
  [ESysVarType.ARRAY]: (value: string) => JSON.parse(value),
  [ESysVarType.BOOLEAN]: (value: string) => value === 'true',
  [ESysVarType.MAP]: (value: string) => new Map<any, any>(JSON.parse(value)),
  [ESysVarType.MULTILINE_STRING]: (value: string) => value,
  [ESysVarType.NUMBER]: (value: string) => Number(value) || 0,
  [ESysVarType.OBJECT]: (value: string) => JSON.parse(value),
  [ESysVarType.STRING]: (value: string) => value,
};

export const SYS_VAR_TYPE_TO_RAW_FUNCTIONS: TTypeToRawConvertDictionary = {
  [ESysVarType.BOOLEAN]: (value: boolean) => {
    checkNullAndUndefined(value);

    return value.toString();
  },
  [ESysVarType.NUMBER]: (value: number) => {
    checkNullAndUndefined(value);

    return value.toString();
  },
  [ESysVarType.STRING]: (value: string) => {
    checkNullAndUndefined(value);

    return value;
  },
  [ESysVarType.MULTILINE_STRING]: (value: string) => {
    checkNullAndUndefined(value);

    return value;
  },
  [ESysVarType.OBJECT]: (value: any) => {
    checkNullAndUndefined(value);

    return JSON.stringify(value);
  },
  [ESysVarType.ARRAY]: (value: any) => {
    checkNullAndUndefined(value);

    return JSON.stringify(value);
  },
  [ESysVarType.MAP]: (value: Map<any, any>) => {
    checkNullAndUndefined(value);

    return JSON.stringify(Array.from(value));
  },
};

function checkNullAndUndefined(value: any) {
  if (value === undefined) {
    throw new Error(`Value cannot be undefined`);
  }

  if (value === null) {
    throw new Error(`Value cannot be null`);
  }
}
