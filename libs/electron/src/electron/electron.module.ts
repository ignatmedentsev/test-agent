import type { DynamicModule } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';
import { AppUpdater, autoUpdater } from 'electron-updater';

import { AgentConfigService } from '~agent/services';
import { AuthModule } from '~core/auth';
import { LogService } from '~core/log';
import { SocketModule } from '~core/socket';

import { ElectronAppService } from './electron-app.service';
import { TrayService } from './tray.service';
import { UpdaterCron } from './updater.cron';
import { UpdaterService } from './updater.service';

@Global()
@Module({})
export class ElectronModule {
  static forRoot(): DynamicModule {
    return {
      module: ElectronModule,
      imports: [
        AuthModule,
        SocketModule,
      ],
      providers: [
        ElectronAppService,
        TrayService,
        UpdaterCron,
        UpdaterService,
        {
          provide: AppUpdater,
          inject: [AgentConfigService, LogService],
          useFactory: (configService: AgentConfigService, logger: LogService) => {
            autoUpdater.logger = logger;
            autoUpdater.fullChangelog = true;
            autoUpdater.autoInstallOnAppQuit = configService.getAutoUpdateOption();
            autoUpdater.autoDownload = configService.getAutoUpdateOption();

            return autoUpdater;
          },
        },
      ],
      exports: [ElectronAppService, TrayService, UpdaterService],
    };
  }
}
