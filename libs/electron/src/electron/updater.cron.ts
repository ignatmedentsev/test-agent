import { CronExpression } from '@nestjs/schedule';

import type { CronInterface } from '~core/cron';
import { Cron } from '~core/cron';

import { UpdaterService } from './updater.service';

@Cron('UPDATER_CHECK_NEW_VERSION', { time: CronExpression.EVERY_HOUR, log: false, transaction: false })
export class UpdaterCron implements CronInterface {
  constructor(
    private readonly updaterService: UpdaterService,
  ) {}

  public async run() {
    await this.updaterService.checkForUpdates();
  }
}
