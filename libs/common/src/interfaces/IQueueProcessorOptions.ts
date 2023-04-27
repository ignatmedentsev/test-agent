export interface IQueueProcessorOptions {
  log?: boolean;
  maxAttempts?: number;
  parallelThreads?: number;
  processingDelay?: number;
  timeout?: number;
}
