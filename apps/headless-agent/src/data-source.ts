import { DataSource } from 'typeorm';
import type { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

import { HeadlessPathService } from './modules/headless-path';

const pathService = new HeadlessPathService();
const connectionOptions: SqliteConnectionOptions = {
  type: 'sqlite',
  database: pathService.getPathToDb(),
  entities: [pathService.getPathToDbEntities(), pathService.getPathToCoreDbEntities()],
  migrations: [pathService.getPathToDbMigrations(), pathService.getPathToCoreDbMigrations()],
  migrationsRun: false,
  synchronize: false,
};
export const DefaultSource = new DataSource(connectionOptions);

DefaultSource.initialize()
  .then(() => console.log('DefaultSource initialized successfully'))
  .catch((e) => console.error(`DefaultSource init error: ${e}`));
