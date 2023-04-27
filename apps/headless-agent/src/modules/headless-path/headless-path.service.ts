import { Injectable } from '@nestjs/common';
import path from 'path';

import { PathService } from '~agent/services';

@Injectable()
export class HeadlessPathService extends PathService {
  public getPathToData() {
    return path.resolve('data');
  }

  public getPathToRender(): string {
    throw new Error('Not implemented');
  }

  public getPathToImages(): string {
    throw new Error('Not implemented');
  }

  protected getAppPath() {
    return path.resolve();
  }

  protected getPathToLibs() {
    return path.join(this.getAppPath(), 'dist', 'libs');
  }
}
