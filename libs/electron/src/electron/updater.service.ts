import type { OnApplicationBootstrap } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { app, dialog, nativeImage, Notification } from 'electron';
import type { UpdateInfo } from 'electron-updater';
import { AppUpdater } from 'electron-updater';
import * as fs from 'fs';
import path from 'path';
import util from 'util';

import { AgentPathService } from '~agent/services';
import { DesktopAgentConfigService } from '~agent/services';
import { ERenderSocketEventType } from '~common/enums';
import { LogService } from '~core/log';
import { SocketService } from '~core/socket';

import { ElectronAppService } from './electron-app.service';

enum EUpdaterEvent {
  UPDATE_AVAILABLE = 'update-available',
  DOWNLOAD_PROGRESS = 'download-progress',
  UPDATE_DOWNLOADED = 'update-downloaded',
  APPIMAGE_FILENAME_UPDATED = 'appimage-filename-updated',
}

@Injectable()
export class UpdaterService implements OnApplicationBootstrap {
  constructor(
    private readonly autoUpdater: AppUpdater,
    private readonly logger: LogService,
    private readonly socketService: SocketService,
    private readonly configService: DesktopAgentConfigService,
    private readonly electronAppService: ElectronAppService,
    private readonly pathService: AgentPathService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  public onApplicationBootstrap() {
    this.subscribeEvents();
    if (this.configService.getAutoUpdateOption()) {
      // need void for socket intro render process
      // TODO: fix bug (in render process don`t show update.component if checkForUpdates run before run electron window)
      void this.checkForUpdates();
    }
  }

  public async checkForUpdates() {
    this.logger.debug('Check update start');

    try {
      const updateData = await this.autoUpdater.checkForUpdates();

      if (!updateData) {
        return;
      }

      this.logger.debug(`Update is available. Version: ${updateData.updateInfo.version}`);
      this.logger.debug(`Auto update setting is ${this.configService.getAutoUpdateOption()}`);

      if (!this.configService.getAutoUpdateOption()) {
        const action = await this.confirmUpdate(updateData.updateInfo);

        if (action.response === 0) {
          await this.autoUpdater.downloadUpdate();
          this.quitAndInstall();
        } else {
          this.socketService.server.emit(ERenderSocketEventType.CANCEL_UPDATE, true);
        }

        return;
      }

      if (app.getVersion() !== updateData.updateInfo.version) {
        this.showUpdateProcessNotification(updateData.updateInfo);
      }
    } catch (error) {
      this.logger.error(util.inspect(error));
    }
  }

  public quitAndInstall() {
    this.autoUpdater.quitAndInstall();
  }

  private async confirmUpdate(updateInfo: UpdateInfo) {
    return dialog.showMessageBox(
      this.electronAppService.getMainWindow(),
      {
        title: 'Update is available',
        message: `New version: ${updateInfo.version} is available for download`,
        buttons: ['Download and Update', 'Cancel'],
      },
    );
  }

  private showUpdateProcessNotification(updateInfo: UpdateInfo) {
    const icon = process.platform === 'win32'
      ? nativeImage.createFromPath(path.join(this.pathService.getPathToImages(), 'tray-icon.ico'))
      : nativeImage.createFromPath(path.join(this.pathService.getPathToImages(), 'tray-icon.png'));

    const installUpdateNotification = new Notification({
      title: 'New update',
      body: `The update version: ${updateInfo.version} will install automatically. Don\`t close app.`,
      icon,
    });
    installUpdateNotification.show();

    setTimeout(() => installUpdateNotification.close(), 13000);
  }

  private subscribeEvents() {
    this.autoUpdater.on(EUpdaterEvent.APPIMAGE_FILENAME_UPDATED, (appPath: string) => {
      // fix for linux (because after update new version Appimage renames self after update to updater.appimage) and remove version from filename
      // AppData\Local\marketplace-agent-updater\pending\update.exe not correct path in windows but app name is normal (research issue)
      if (process.platform === 'linux') {
        fs.renameSync(appPath, appPath.replace('update', 'Marketplace-Agent'));
      }
    });
    this.autoUpdater.on(EUpdaterEvent.UPDATE_AVAILABLE, (event) => {
      this.logger.debug(`New version: ${event.version} is available`);
      this.socketService.server.emit(ERenderSocketEventType.HAS_NEW_VERSION, true);
    });
    this.autoUpdater.on(EUpdaterEvent.DOWNLOAD_PROGRESS, (event) => {
      this.socketService.server.emit(ERenderSocketEventType.UPDATE_PROGRESS, { percent: event.percent });
    });
    this.autoUpdater.on(EUpdaterEvent.UPDATE_DOWNLOADED, () => {
      setTimeout(() => this.autoUpdater.quitAndInstall(), 1000);
    });
  }
}
