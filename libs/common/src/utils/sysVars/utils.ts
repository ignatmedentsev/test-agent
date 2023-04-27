import type { ESysVarName } from '~common/enums';

import { SYS_VARS_DICTIONARY } from './const';

export function getConfig(name: string) {
  if (!SYS_VARS_DICTIONARY[name as ESysVarName]) {
    throw new Error(`Unknown system variable name "${name}"`);
  }

  return SYS_VARS_DICTIONARY[name as ESysVarName];
}
