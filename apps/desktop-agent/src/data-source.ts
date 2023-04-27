import * as fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import type { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

const connectionOptions: SqliteConnectionOptions = {
  type: 'sqlite',
  database: path.resolve(fs.readFileSync(path.resolve(__dirname, 'database.path')).toString(), 'agent.sql'),
  entities: ['dist/libs/agent/src/entity/**/*.js', 'dist/libs/core/src/**/*.entity.js'],
  migrations: ['dist/libs/agent/src/migration/**/*.js', 'dist/libs/core/src/migration/**/*.js'],
  migrationsRun: false,
  synchronize: false,
};
export const DefaultSource = new DataSource(connectionOptions);

DefaultSource.initialize()
  .then(() => console.log('DefaultSource initialized successfully'))
  .catch((e) => console.error(`DefaultSource init error: ${e}`));
