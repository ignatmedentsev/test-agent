import type { OnApplicationBootstrap } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { MenuItemConstructorOptions } from 'electron';
import { Menu, Tray, nativeImage } from 'electron';
import path from 'path';
import { combineLatest } from 'rxjs';

import { AgentInitService } from '~agent/modules/agent';
import { AgentPathService } from '~agent/services';
import { AuthService } from '~core/auth';
import { LogService } from '~core/log';
import { SocketClientService } from '~core/socket';

import { ElectronAppService } from './electron-app.service';
import { UpdaterService } from './updater.service';

@Injectable()
export class TrayService implements OnApplicationBootstrap {
  private tray: Tray;
  private isOnline = false;
  private isLoggedIn = false;
  private additionalMenuItems: Electron.MenuItemConstructorOptions[] = [];
  private imagesPath = '';

  private readonly separatorItem: MenuItemConstructorOptions = { type: 'separator' };
  private readonly quitItem: MenuItemConstructorOptions = {
    id: 'quit',
    label: 'Quit',
    role: 'quit',
    accelerator: 'CommandOrControl+Q',
  };

  private readonly login: MenuItemConstructorOptions = {
    id: 'login',
    label: `Login`,
    click: () => this.electronAppService.createWindow(),
  };

  private readonly showApp: MenuItemConstructorOptions = {
    id: 'open',
    label: `Show Agent`,
    click: () => this.electronAppService.createWindow(),
  };

  private readonly logout: MenuItemConstructorOptions = {
    id: 'logout',
    label: `Logout`,
    click: async () => this.authService.logout(),
  };

  private readonly checkUpdate: MenuItemConstructorOptions = {
    id: 'checkUpdate',
    label: `Check update`,
    click: async () => this.updaterService.checkForUpdates(true),
  };

  constructor(
    private readonly logger: LogService,
    private readonly updaterService: UpdaterService,
    private readonly electronAppService: ElectronAppService,
    private readonly authService: AuthService,
    private readonly socketClientService: SocketClientService,
    private readonly pathService: AgentPathService,
    private readonly agentInitService: AgentInitService,
  ) {
    this.logger.setContext(this.constructor.name);
    this.imagesPath = this.pathService.getPathToImages();
  }

  public onApplicationBootstrap() {
    this.initTray();

    combineLatest({
      isAuthenticated: this.authService.isAuth,
      isConnected: this.socketClientService.isConnected,
    })
      .subscribe((value => {
        this.isLoggedIn = value.isAuthenticated;
        this.isOnline = value.isConnected && value.isAuthenticated;
        this.setContextMenu();
      }));
  }

  public setContextMenu(menuItems: Electron.MenuItemConstructorOptions[] = []) {
    this.initTray();

    this.additionalMenuItems = menuItems;

    const trayMenu = Menu.buildFromTemplate([
      this.isOnline ? this.online() : this.offline(),
      this.isLoggedIn ? this.logout : this.login,
      this.separatorItem,
      ...this.additionalMenuItems,
      this.showApp,
      this.checkUpdate,
      this.appVersion(),
      this.separatorItem,
      this.quitItem,
    ]);
    this.tray.closeContextMenu();
    this.tray.setContextMenu(trayMenu);
  }

  private initTray() {
    if (this.tray) {
      return;
    }

    const trayIcon = process.platform === 'win32'
      ? nativeImage.createFromPath(path.join(this.imagesPath, 'tray-icon.ico'))
      : nativeImage.createFromPath(path.join(this.imagesPath, 'tray-icon.png'));
    this.tray = new Tray(trayIcon);
    this.setContextMenu();
    this.tray.setToolTip('Nanox Marketplace Agent');

    if (process.platform === 'win32') {
      this.tray.on('click', () => {
        this.electronAppService.createWindow();
      });
    }
  }

  private appVersion(): MenuItemConstructorOptions {
    return {
      id: 'version',
      label: `Version: ${this.agentInitService.getVersion()}`,
      enabled: false,
    };
  }

  private online(): MenuItemConstructorOptions {
    return {
      id: 'online',
      label: 'NANOX Marketplace Agent is online',
      type: 'normal',
      icon: nativeImage.createFromPath(path.join(this.imagesPath, 'online.png')),
      enabled: false,
    };
  }

  private offline(): MenuItemConstructorOptions {
    return {
      id: 'offline',
      label: 'NANOX Marketplace Agent is offline',
      type: 'normal',
      icon: nativeImage.createFromPath(path.join(this.imagesPath, 'offline.png')),
      enabled: false,
    };
  }
}
