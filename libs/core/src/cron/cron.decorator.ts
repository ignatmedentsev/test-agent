import { applyDecorators, SetMetadata } from '@nestjs/common';
import type { CronExpression } from '@nestjs/schedule';

import { CRON_NAME, CRON_OPTIONS } from './cron.constants';

export interface CronOptions {
  /**
   * Set falsy callback if a cron task must be disabled (default: true).
   * Could be useful for conditional cron usage depending on environment.
   */
  enabled?: () => boolean;

  /**
   * Set to false if no log about each running is needed (default: true).
   * Could be useful for the tasks repeated very often.
   * Errors and warnings will still be recorded.
   */
  log?: boolean;

  /**
   * Set if it's a system cron task which is not needed to be configured via system variable (but it's still possible!)
   */
  time?: CronExpression | string;

  /**
   * Set to false if no database transaction is needed (default: true).
   * Could be useful for select-only tasks that don't change anything in the database.
   */
  transaction?: boolean;
}

/**
 * Creates a scheduled cron task.
 *
 * @param name Name of the cron task.
 * @param options Cron execution options.
 */
export function Cron(
  name: string,
  options: CronOptions = {},
): ClassDecorator {
  return applyDecorators(
    SetMetadata(CRON_NAME, name),
    SetMetadata(CRON_OPTIONS, options),
  );
}
