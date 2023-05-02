import { Injectable } from '@nestjs/common';
import { app } from 'electron';
import path from 'path';

import { AgentPathService } from '~agent/services';

@Injectable()
export class DesktopPathService extends AgentPathService {
  public getPathToLibs() {
    return process.env.NODE_ENV === 'dev'
      ? path.join(this.getAppPath(), '..', '..', '..', 'libs')
      : path.join(this.getAppPath(), 'libs');
  }

  public getPathToImages() {
    return process.env.NODE_ENV === 'dev'
      ? path.join(this.getAppPath(), 'assets', 'images')
      : path.join(this.getAppPath(), 'apps', 'desktop-agent', 'src', 'assets', 'images');
  }

  public getPathToRender() {
    return process.env.NODE_ENV === 'dev'
      ? path.join(this.getAppPath(), '..', 'render')
      : path.join(this.getAppPath(), 'render');
  }

  public getPathToData() {
    return app.getPath('userData');
  }

  protected getAppPath() {
    return app.getAppPath();
  }
}
