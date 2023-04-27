import { Injectable } from '@nestjs/common';

import type { DbService } from '../db';
import { LogService } from '../log';

import type { CronInterface } from './cron.interface';
import { CronRegistry } from './cron.registry';

@Injectable()
export class CronRunner {
  constructor(
    private readonly logger: LogService,
    private readonly registry: CronRegistry,
  ) {
    logger.setContext(this.constructor.name);
  }

  public async processCronTask(db: DbService, name: string, cronTask: CronInterface) {
    this.registry.markTaskAsStarted(name);

    try {
      this.logInfo(name, `Task ${name} started...`);

      await cronTask.run(db);

      this.logInfo(name, `Task ${name} successfully executed`);
    } catch (error: any) {
      // we need to rollback transaction manually, because the processing API will not be failed
      if (db.queryRunner?.isTransactionActive) {
        await db.queryRunner.rollbackTransaction();
      }

      const errorStackTrace = error?.stack ?? error;

      this.logger.error(`Task ${name} failed: ${errorStackTrace}`);
    } finally {
      this.registry.markTaskAsFinished(name);
    }
  }

  private logInfo(name: string, message: string) {
    if (this.registry.isLogEnabled(name)) {
      this.logger.info(message);
    }
  }
}
