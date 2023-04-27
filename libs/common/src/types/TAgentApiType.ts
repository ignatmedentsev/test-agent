/* eslint-disable @typescript-eslint/indent */

import type { EAgentApiUrl } from '../enums';
import type { IGetOrganizationInfo } from '../interfaces';

export type TAgentApiType<T = EAgentApiUrl> =
  T extends EAgentApiUrl.AGENT_AUTH ? IGetOrganizationInfo :
  T extends EAgentApiUrl.GET_ORGANIZATION_INFO ? IGetOrganizationInfo :
never;

