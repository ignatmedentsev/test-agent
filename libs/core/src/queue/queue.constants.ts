import type { QueueOptions } from './queue.decorator';

export const QUEUE_NAME = 'QUEUE_NAME';
export const QUEUE_OPTIONS = 'QUEUE_OPTIONS';

export const DEFAULT_QUEUE_OPTIONS: Required<QueueOptions> = {
  deleteAvailable: true,
  enabled: () => true,
  log: true,
  maxAttempts: 1,
  parallelThreads: 1,
  preserveFailedItems: true,
  processingDelay: 0,
  restartAvailable: true,
  timeout: 300000,
  transaction: true,
};
