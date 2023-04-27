/* eslint-disable @typescript-eslint/indent */

import type { EOrganizationSettings, EPlatformSocketEventType } from '~common/enums';
import type { IDevice, IOrganizationInfo, IUserInfo } from '~common/interfaces';

import type { TAgentPublicPacsServerOptions } from './TAgentPublicPacsServerOptions';
import type { TNewTaskDescription } from './TNewTaskDescription';
import type { TOrganizationSettingChange } from './TOrganizationSettingChange';

type BaseSocketPayload = {
  _ts: number,
}

export type TPlatformSocketEventPayload<T = EPlatformSocketEventType, K = EOrganizationSettings> =
  BaseSocketPayload &
  (
    T extends EPlatformSocketEventType.REFRESH_AGENT_KEY ? never :
    T extends EPlatformSocketEventType.NEW_TASK ? TNewTaskDescription<any, any> :
    T extends EPlatformSocketEventType.DEVICE_TOKENS_CHANGED ? { devices: IDevice[]} :
    T extends EPlatformSocketEventType.UPDATE_PUBLIC_PACS_SERVER_CONFIG ? TAgentPublicPacsServerOptions :
    T extends EPlatformSocketEventType.ORGANIZATION_CHANGED ? IOrganizationInfo :
    T extends EPlatformSocketEventType.ORGANIZATION_SETTINGS_CHANGED ? TOrganizationSettingChange<K> :
    T extends EPlatformSocketEventType.USER_CHANGED ? IUserInfo :
    never
  )

