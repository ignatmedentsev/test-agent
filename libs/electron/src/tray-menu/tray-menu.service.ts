import type { OnApplicationBootstrap } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { MenuItemConstructorOptions } from 'electron';
import util from 'util';

import { OrganizationService } from '~agent/modules/organization';
import { AuthService } from '~core/auth';
import { LogService } from '~core/log';
import { QueueManagerService } from '~core/queue';
import { TrayService } from '~electron/electron';

@Injectable()
export class TrayMenuService implements OnApplicationBootstrap {
  private readonly reprocessStuckItemsMenuItem: MenuItemConstructorOptions = {
    id: 'reprocess',
    label: `Reprocess stuck items`,
    click: async () => {
      try {
        this.logger.info('Reprocessing of stuck items started');
        const reprocessedItems = await this.queueManager.reprocessStuckItems();
        this.logger.info(`Successfully queued ${reprocessedItems.length} items`);
      } catch (error) {
        this.logger.error(`Reprocessing error: ${util.inspect(error)}`);
      }
    },
  };

  constructor(
    private readonly organizationService: OrganizationService,
    private readonly queueManager: QueueManagerService,
    private readonly trayService: TrayService,
    private readonly authService: AuthService,
    private readonly logger: LogService,
  ) {
    logger.setContext(this.constructor.name);
  }

  public onApplicationBootstrap() {
    this.authService.isAuth.subscribe({
      next: (value) => {
        if (value && this.organizationService.isIF()) {
          this.setIfMenu();
        }
      },
    });
  }

  private setIfMenu() {
    const menuItems = [this.reprocessStuckItemsMenuItem];

    this.trayService.setContextMenu(menuItems);
  }
}
