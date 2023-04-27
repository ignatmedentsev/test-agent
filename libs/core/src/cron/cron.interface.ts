import type { DbService } from '../db';

export interface CronInterface {
  run: (db: DbService) => void | Promise<void>;
}
