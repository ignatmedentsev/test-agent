import { Module } from '@nestjs/common';

import { OrganizationModule } from '~agent/modules/organization';
import { LogModule } from '~core/log';

import { TrayMenuService } from './tray-menu.service';

@Module({
  imports: [
    OrganizationModule,
    LogModule,
  ],
  providers: [
    TrayMenuService,
  ],
  exports: [
    TrayMenuService,
  ],
})
export class TrayMenuModule { }
