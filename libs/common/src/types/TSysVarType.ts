/* eslint-disable @typescript-eslint/indent */

import type { ESysVarName } from '~common/enums';

export type TSysVarType<T extends string> =
  T extends ESysVarName.AGENT_UUID ? string :
never;
