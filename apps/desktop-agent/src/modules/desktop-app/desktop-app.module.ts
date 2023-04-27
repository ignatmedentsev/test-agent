import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { app } from 'electron';

import { AgentModule } from '~agent/modules/agent';
import { DeviceModule } from '~agent/modules/device';
import { OrganizationModule } from '~agent/modules/organization';
import { PacsModule } from '~agent/modules/pacs';
import { DESKTOP_APP_HTTPS_PORT } from '~common/constants';
import { EAgentMode } from '~common/enums';
import { ErrorFilter } from '~core/filter';
import { LogInterceptor } from '~core/interceptors';
import { ElectronModule } from '~electron/electron';
import { SystemModule } from '~electron/system';
import { TrayMenuModule } from '~electron/tray-menu';

import { DesktopConfigModule } from '../desktop-config';
import { DesktopPathModule } from '../desktop-path';

import { DesktopAppController } from './desktop-app.controller';
import { DesktopAppService } from './desktop-app.service';

@Module({
  imports: [
    DesktopConfigModule.forRoot(),
    ElectronModule.forRoot(),
    ScheduleModule.forRoot(),
    DesktopPathModule,
    AgentModule.forRoot({
      version: app.getVersion(),
      port: DESKTOP_APP_HTTPS_PORT,
      mode: EAgentMode.STANDALONE,
    }),
    SystemModule,
    DeviceModule,
    PacsModule,
    TrayMenuModule,
    OrganizationModule,
  ],
  controllers: [DesktopAppController],
  providers: [
    DesktopAppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LogInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
  ],
})
export class DesktopAppModule {}
