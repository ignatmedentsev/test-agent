import type { IDevice, IPacsServer } from '~common/interfaces';
import type { THttpsOptions } from '~common/types';

export type TAgentAuthInfo = {
  key: string,
  uuid: string,
  devices: IDevice[],
  httpsOptions: THttpsOptions,
  publicPacsServer: IPacsServer,
};
