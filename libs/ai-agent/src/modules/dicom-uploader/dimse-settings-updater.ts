import { Injectable } from '@nestjs/common';

import { AiAgentConfigService } from '~ai-agent/services';
import { EPlatformSocketEventType } from '~common/enums';
import { LogService } from '~core/log';
import { SocketClientService } from '~core/socket';

@Injectable()
export class DimseSenderSettingsUpdater {
  constructor(
    private readonly socketClientService: SocketClientService,
    private readonly configService: AiAgentConfigService,
    private readonly logger: LogService,
  ) {
    logger.setContext(this.constructor.name);
  }

  public onApplicationBootstrap() {
    this.socketClientService.subscribePlatformEvent(EPlatformSocketEventType.UPDATE_PUBLIC_PACS_SERVER_CONFIG,
      ({ publicPacsServer }) => {
        this.logger.info('Updating public PACS server settings');
        this.configService.setMarketplacePublicPacs(publicPacsServer);
      });
  }
}
