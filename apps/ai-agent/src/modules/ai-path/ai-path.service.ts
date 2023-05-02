import { Injectable } from '@nestjs/common';
import path from 'path';

import { AiAgentPathService } from '~ai-agent/services';

@Injectable()
export class AiPathService extends AiAgentPathService {
  public getPathToData() {
    return path.resolve('ai-data');
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
