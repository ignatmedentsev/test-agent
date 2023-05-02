import { DataSource } from 'typeorm';
import type { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

import { AiPathService } from './modules/ai-path';

const pathService = new AiPathService();
const connectionOptions: SqliteConnectionOptions = {
  type: 'sqlite',
  database: pathService.getPathToDb(),
  entities: [pathService.getPathToCoreDbEntities(), pathService.getPathToDbEntities()],
  migrations: [pathService.getPathToCoreDbMigrations(), pathService.getPathToDbMigrations()],
  migrationsRun: false,
  synchronize: false,
};
export const DefaultSource = new DataSource(connectionOptions);

DefaultSource.initialize()
  .then(() => console.log('DefaultSource initialized successfully'))
  .catch((e) => console.error(`DefaultSource init error: ${e}`));
