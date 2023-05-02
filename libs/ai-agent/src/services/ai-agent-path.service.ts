import path from 'path';

import { CorePathService } from '~core/services';

export abstract class AiAgentPathService extends CorePathService {
  public getPathToDbMigrations() {
    return path.resolve(this.getPathToLibs(), 'ai-agent', 'src', 'migration', '**', '*.js');
  }

  public getPathToDbEntities() {
    return path.resolve(this.getPathToLibs(), 'ai-agent', 'src', 'entity', '**', '*.js');
  }
}
