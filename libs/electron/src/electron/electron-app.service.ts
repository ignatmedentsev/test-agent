import type { OnApplicationBootstrap } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Event } from 'electron';
import { app as electronApp, Menu, screen, BrowserWindow } from 'electron';
import path from 'path';

import { AgentPathService } from '~agent/services';
import { LogService } from '~core/log';

enum EAppEvents {
  ACTIVATE = 'activate',
  CERTIFICATE_ERROR = 'certificate-error',
  SECOND_INSTANCE = 'second-instance',
  WINDOW_ALL_CLOSED = 'window-all-closed',
}

enum EWindowEvents {
  READY_TO_SHOW = 'ready-to-show',
  DID_FINISH_LOAD = 'did-finish-load',
  DID_FAIL_LOAD = 'did-fail-load',
  CLOSE = 'close',
  CLOSED = 'closed',
  BLUR = 'blur',
  SHOW = 'show',
}

@Injectable()
export class ElectronAppService implements OnApplicationBootstrap {
  private app = electronApp;
  private mainWindow: BrowserWindow;

  constructor(
    private readonly logger: LogService,
    private readonly pathService: AgentPathService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  public async onApplicationBootstrap() {
    await this.initSettings();
    this.createWindow();
  }

  public getMainWindow() {
    return this.mainWindow;
  }

  public createWindow() {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      const { workArea } = screen.getPrimaryDisplay();

      this.setUpDock();
      this.mainWindow = new BrowserWindow({
        height: 768,
        width: 1366,
        minHeight: 720,
        minWidth: 1280,
        maxWidth: workArea.width,
        maxHeight: workArea.height,
        show: false,
        icon: path.join(this.pathService.getPathToImages(), 'app-icon.png'),
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      if (process.env.NODE_ENV === 'dev') {
        void this.mainWindow.loadURL('http://localhost:4201/');
        this.mainWindow.webContents.openDevTools({ mode: 'bottom' });
      } else {
        if (process.env.SHOW_DEV_TOOLS === 'true') {
          this.mainWindow.webContents.openDevTools({ mode: 'bottom' });
        }
        void this.mainWindow.loadFile(path.join(this.pathService.getPathToRender(), 'index.html'));
        Menu.setApplicationMenu(null);
      }

      this.mainWindow.once(EWindowEvents.READY_TO_SHOW, () => this.mainWindow.show());
      this.mainWindow.webContents.once(EWindowEvents.DID_FINISH_LOAD, () => this.logger.log(`window ${EWindowEvents.DID_FINISH_LOAD}`));
      this.mainWindow.webContents.once(EWindowEvents.DID_FAIL_LOAD, (_, errCode, errDesc, errUrl) => {
        this.logger.log(`window ${EWindowEvents.DID_FAIL_LOAD}: ${errCode} ${errDesc} ${errUrl}`);
      });
      this.mainWindow.on(EWindowEvents.CLOSE, () => this.logger.log(`window ${EWindowEvents.CLOSE}`));
      this.mainWindow.on(EWindowEvents.CLOSED, () => this.logger.log(`window ${EWindowEvents.CLOSED}`));
    } else {
      this.mainWindow.show();
    }
  }

  private async initSettings() {
    const hasInstance = this.app.requestSingleInstanceLock();

    if (!hasInstance) {
      this.app.quit();
    } else {
      this.app.on(EAppEvents.SECOND_INSTANCE, () => {
        this.app.focus();
      });
    }

    if (process.platform === 'win32') {
      this.app.setAppUserModelId(this.app.name);
    }

    this.app.on(EAppEvents.WINDOW_ALL_CLOSED, (e: Event) => {
      if (process.platform === 'darwin') {
        this.app.dock?.hide();
      }
      e.preventDefault();
    });

    await this.app.whenReady();

    this.app.on(EAppEvents.ACTIVATE, () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });
  }

  private setUpDock() {
    if (process.platform === 'darwin' && !this.app.dock?.isVisible()) {
      void this.app.dock?.show();
    }
  }
}
