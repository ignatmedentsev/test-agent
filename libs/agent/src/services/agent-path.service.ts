import path from 'path';

import { CorePathService } from '~core/services';

export abstract class AgentPathService extends CorePathService {
  public getPathToDbMigrations() {
    return path.resolve(this.getPathToLibs(), 'agent', 'src', 'migration', '**', '*.js');
  }

  public getPathToDbEntities() {
    return path.resolve(this.getPathToLibs(), 'agent', 'src', 'entity', '**', '*.js');
  }
}
