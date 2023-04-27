/* eslint-disable @typescript-eslint/indent */

import type { EOrganizationSettings } from '~common/enums';

export type TAgentOrganizationSetting<T = EOrganizationSettings> =
  T extends EOrganizationSettings.MEDCLOUD_INTERNAL ? boolean :
  never;
