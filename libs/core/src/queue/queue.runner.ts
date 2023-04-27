import { Injectable } from '@nestjs/common';

import type { DbService } from '../db';
import { NonTxDbService } from '../db';
import { LogService } from '../log';

import type { Queue } from './queue.entity';
import type { QueueInterface } from './queue.interface';
import { QueueRegistry } from './queue.registry';
import { QueueRepository } from './queue.repository';
import { timeout } from './queue.utils';

@Injectable()
export class QueueRunner {
  constructor(
    private readonly nonTxDb: NonTxDbService,
    private readonly logger: LogService,
    private readonly registry: QueueRegistry,
    private readonly queueRepository: QueueRepository,
  ) {
    logger.setContext(this.constructor.name);
  }

  public async processQueueItem(db: DbService, queueItem: Queue, queueTask: QueueInterface) {
    const { id, type, modifier } = queueItem;

    this.logDebug(type, `Item #${id} in queue "${type}-${modifier}" started: priority ${queueItem.priority}`);

    const itemTimeout = this.registry.getTimeout(type);

    try {
      await timeout(queueTask.processItem(db, queueItem.payload, queueItem), itemTimeout);

      await this.deleteFromQueue(this.nonTxDb, queueItem);

      this.logDebug(type, `Item #${id} in queue "${type}-${modifier}" succesfully finished`);
    } catch (error: any) {
      // we need to rollback transaction manually, because the processing API will not be failed
      if (db.queryRunner?.isTransactionActive) {
        await db.queryRunner.rollbackTransaction();
      }

      queueItem.attempt += 1;

      const errorStackTrace = error?.stack ?? error;

      if (
        queueItem.attempt >= this.registry.getMaxAttempts(type)
        || (queueTask.isUnrecoverableError && await queueTask.isUnrecoverableError(error))
      ) {
        this.logger.error(`Item #${id} in queue "${type}-${modifier}" failed: ${errorStackTrace}`);

        if (queueTask.afterError) {
          try {
            await queueTask.afterError(this.nonTxDb, error, queueItem); // TODO: create separate transaction for afterError - in case it failed
          } catch (error2: any) {
            this.logger.error(`Item #${id} in queue "${type}-${modifier}": error in method afterError: ${error2.stack}`);
          }
        }
        if (this.registry.isPreserveFailedItemsEnabled(type)) {
          await this.nonTxDb.withRepository(this.queueRepository).setErrorToQueue(queueItem, errorStackTrace);
        } else {
          await this.deleteFromQueue(this.nonTxDb, queueItem);
        }
      } else {
        this.logger.warn(`Item #${id} in queue "${type}-${modifier}" delayed (attempt #${queueItem.attempt}): ${errorStackTrace}`);

        if (queueTask.afterUnsuccessfulAttempt) {
          try {
            await queueTask.afterUnsuccessfulAttempt(this.nonTxDb, error, queueItem);
          } catch (error2: any) {
            this.logger.error(`Item #${id} in queue "${type}-${modifier}": error in method afterUnsuccessfulAttempt: ${error2.stack}`);
          }
        }

        await this.nonTxDb.withRepository(this.queueRepository).delayTask(queueItem, errorStackTrace);
      }
    }
  }

  public async deleteFromQueue(db: NonTxDbService, queueItem: Queue) {
    const queueTask = this.registry.getTask(queueItem.type);
    if (queueTask.cleanup) {
      try {
        await queueTask.cleanup(
          db,
          queueItem.payload,
          queueItem,
        );
      } catch (cleanupError: any) {
        this.logger.error(`Item #${queueItem.id} in queue "${queueItem.type}-${queueItem.modifier}": error in method cleanup: ${cleanupError.stack}`);
      }
    }

    await this.nonTxDb.withRepository(this.queueRepository).removeFromQueue(queueItem.id!);
  }

  private logDebug(type: string, message: string) {
    if (this.registry.isLogEnabled(type)) {
      this.logger.debug(message);
    }
  }
}
