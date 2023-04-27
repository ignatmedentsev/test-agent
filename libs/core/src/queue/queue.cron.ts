import type { CronInterface } from '../cron';
import { Cron } from '../cron';

import { QueueService } from './queue.service';

@Cron('QUEUE_RESTARTER', { time: '17 */5 * * * *', log: false, transaction: false })
export class QueueCron implements CronInterface {
  constructor(
    private readonly queueService: QueueService,
  ) {}

  public async run() {
    await this.queueService.runAllQueues();
  }
}
