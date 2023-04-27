import type { IAbstractEntity } from '~common/interfaces';

import type { DbService } from '../db';

import type { Queue } from './queue.entity';
import type { EQueuePriority, EQueueStatus } from './queue.enums';

export interface QueueInterface {
  processItem: (db: DbService, queueItemPayload: string, queueItem: Queue) => Promise<void>;

  afterError?: (db: DbService, error: Error, queueItem: Queue) => void | Promise<void>;

  afterUnsuccessfulAttempt?: (db: DbService, error: Error, queueItem: Queue) => void | Promise<void>;

  isUnrecoverableError?: (error: Error) => boolean | Promise<boolean>;

  cleanup?: (db: DbService, queueItemPayload: string, queueItem: Queue) => Promise<void>;

}

export interface IQueue extends IAbstractEntity {
  type: string;
  modifier: string;
  payload: string;
  priority: EQueuePriority;
  sort: string;
  status: EQueueStatus;
  error: string;
  attempt: number;
}
