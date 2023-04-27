import path from 'path';

export abstract class PathService {
  protected abstract getPathToLibs(): string;
  public abstract getPathToData(): string;
  protected abstract getAppPath(): string;

  // Desktop only. Should throw exception in headless
  public abstract getPathToImages(): string;
  public abstract getPathToRender(): string;

  public getPathToDbMigrations() {
    return path.resolve(this.getPathToLibs(), 'agent', 'src', 'migration', '**', '*.js');
  }

  public getPathToCoreDbMigrations() {
    return path.resolve(this.getPathToLibs(), 'core', 'src', 'migration', '**', '*.js');
  }

  public getPathToDbEntities() {
    return path.resolve(this.getPathToLibs(), 'agent', 'src', 'entity', '**', '*.js');
  }

  public getPathToCoreDbEntities() {
    return path.resolve(this.getPathToLibs(), 'core', 'src', '**', '*.entity.js');
  }

  public getPathToLogs() {
    return path.resolve(this.getPathToData(), 'logs');
  }

  public getPathToDb() {
    return path.resolve(this.getPathToData(), 'agent.sql');
  }

  public getPathToConfig() {
    return path.resolve(this.getPathToData(), 'config.json');
  }

  public getPathToTemp() {
    return path.resolve(this.getPathToData(), 'temp');
  }

  public getDefaultPathToStorage() {
    return path.resolve(this.getPathToData(), 'storage');
  }
}
