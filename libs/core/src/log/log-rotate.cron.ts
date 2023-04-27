import { CronExpression } from '@nestjs/schedule';

import type { CronInterface } from '~core/cron';
import { Cron } from '~core/cron';

import { LogRotateService } from './log-rotate.service';

@Cron('LOG_ROTATOR', { time: CronExpression.EVERY_HOUR, log: false, transaction: false })

export class LogRotateCron implements CronInterface {
  constructor(
    private readonly logRotatorService: LogRotateService,
  ) {}

  public async run() {
    await this.logRotatorService.rotateLogs();
  }
}
