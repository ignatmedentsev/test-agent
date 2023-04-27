/* eslint-disable @typescript-eslint/indent */

import type { ERenderSocketEventType } from '~common/enums';

export type TRenderSocketEventPayload<T = ERenderSocketEventType> =
  T extends ERenderSocketEventType.REFRESH_AGENT_KEY ? never
  : never;
