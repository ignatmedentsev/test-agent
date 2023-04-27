import type { TAgentOrganizationSetting } from './TAgentOrganizationSetting';

export type TOrganizationSettingChange<K> = {
  name: K,
  value: TAgentOrganizationSetting<K>,
};
