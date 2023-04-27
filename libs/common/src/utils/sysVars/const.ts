import { ESysVarCategory, ESysVarName } from '~common/enums';
import { ESysVarType } from '~common/enums/ESysVarType';

export type TSysVarConfig = {
  allowEmpty: boolean,
  category: ESysVarCategory,
  defaultRawValue: string,
  description: string,
  name: string,
  type: ESysVarType,
  validators: Array<(rawValue: string) => { success: boolean, error: string }>,
}

type TSysVarDictionary = {
  [key in ESysVarName]: TSysVarConfig
}

export type TSysVarCategoryConfig = {
  name: string,
  description: string,
  warning?: boolean,
}

type TSysVarCategoryDictionary = {
  [key in ESysVarCategory]: TSysVarCategoryConfig
}
export const SYS_VAR_CATEGORIES: TSysVarCategoryDictionary = {
  [ESysVarCategory.AGENT]: {
    name: 'Agent',
    description: '',
    warning: true,
  },
};

// TODO: move sys vars to corresponding modules.
export const SYS_VARS_DICTIONARY: TSysVarDictionary = {
  [ESysVarName.AGENT_UUID]: {
    allowEmpty: true,
    category: ESysVarCategory.AGENT,
    defaultRawValue: '',
    description: 'Agent UUID',
    name: 'Agent UUID',
    type: ESysVarType.STRING,
    validators: [],
  },
};
