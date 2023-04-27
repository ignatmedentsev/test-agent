import { applyDecorators, SetMetadata } from '@nestjs/common';

import { QUEUE_NAME, QUEUE_OPTIONS } from './queue.constants';

export interface QueueOptions {
  /**
   * Set falsy callback if a queue task must be disabled (default: true).
   * Could be useful for conditional queue usage depending on environment.
   */
  enabled?: () => boolean;

  /**
   * Max attempts to process item. Set if a queue item must re-run after error (default: 1 - without re-run)
   */
  maxAttempts?: number;

  /**
   * Set to false if no log about each running is needed (default: true).
   * Could be useful for the tasks repeated very often.
   * Errors and warnings will still be recorded.
   */
  log?: boolean;

  /**
   * Timeout (in ms) of executing a single task. Use it when a task may stuck forever.
   * Default timeout: 300000 (5 minutes).
   */
  timeout?: number;

  /**
   * Set to false if no database transaction is needed (default: true).
   * Could be useful for select-only tasks that don't change anything in the database.
   */
  transaction?: boolean;

  /**
   * Is item can be safely restarted through admin interface (default: true).
   */
  restartAvailable?: boolean;

  /**
   * Is item can be safely deleted through admin interface (default: true).
   */
  deleteAvailable?: boolean;

  /**
   * If true all failed items preserve in queue to further manual processing, if false - items are removed.
   * Set to false if there is higher level ability to perform the action (default: true).
   */
  preserveFailedItems?: boolean;

  /**
   * Number of parallel threads for each modifier (default: 1).
   */
  parallelThreads?: number;

  /**
   * Delay (in ms) between processing of each item (default: 0).
   * Could be useful for decrease load on the server.
   */
  processingDelay?: number;
}

/**
 * Creates a queue task.
 *
 * @param name Name of the queue task.
 * @param options Queue options.
 */
export function Queue(
  name: string,
  options: QueueOptions = {},
): ClassDecorator {
  return applyDecorators(
    SetMetadata(QUEUE_NAME, name),
    SetMetadata(QUEUE_OPTIONS, options),
  );
}
