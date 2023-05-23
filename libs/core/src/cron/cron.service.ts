import { HttpService } from '@nestjs/axios';
import type { OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import { lastValueFrom } from 'rxjs';

import { EAgentApiUrl } from '~common/enums'; // TODO: get rid of dependency
import { CoreConfigService } from '~core/services';

import { NonTxDbService } from '../db';
import { LogService } from '../log';

import type { CronOptions } from './cron.decorator';
import type { CronInterface } from './cron.interface';
import { CronRegistry } from './cron.registry';
import { CronRunner } from './cron.runner';

// TODO: make every run (especially for daily tasks) guaranteed (via db)?
@Injectable()
export class CronService implements OnModuleInit {
  private timezone = 'UTC';
  private cronItemProcessEndpoint: string;

  constructor(
    private readonly nonTxDb: NonTxDbService,
    private readonly cronRunner: CronRunner,
    private readonly http: HttpService,
    private readonly logger: LogService,
    private readonly registry: CronRegistry,
    private readonly scheduler: SchedulerRegistry,
    private readonly configService: CoreConfigService,
  ) {
    logger.setContext(this.constructor.name);
    this.cronItemProcessEndpoint = `http://localhost:${this.configService.getHttpPort()}${EAgentApiUrl.SYS_CRON_ITEM_PROCESS}`;
  }

  public onModuleInit() {
    this.logger.info(`Init service for timezone ${this.timezone}`);
  }

  // Examples:
  // */15 * * * * * - every 15 seconds (note: it is non-standard 6 fields mode!)
  // * * * * * - every minute
  // 0 * * * * - every hour at 00 minutes
  // 0 6 * * * - every morning at 6:00
  // more at https://github.com/kelektiv/node-cron
  public setCronTimes(times: Map<string, string>) {
    this.registry.setTimes(times);
  }

  public setTimezone(timezone: string) {
    this.timezone = timezone;
  }

  public startTask(name: string) {
    this.scheduler.getCronJob(name).start();
  }

  public stopTask(name: string) {
    this.scheduler.getCronJob(name).stop();
  }

  public isTaskRunning(name: string) {
    return this.scheduler.getCronJob(name).running;
  }

  public rescheduleTask(name: string, time: string) {
    if (this.registry.getTime(name) === time) {
      return;
    }

    this.registry.setTime(name, time);

    this.logger.info(`Reschedule task ${name} for time ${time}`);

    const job = this.scheduler.getCronJob(name);

    job.stop();
    job.setTime(new CronTime(time));
    job.start();
  }

  public registerTask(name: string, options: CronOptions, cronTaskInstance: CronInterface) {
    if (options.enabled instanceof Function && !options.enabled()) {
      this.logger.warn(`Skip initialization. Task ${name} is disabled`);

      return;
    }

    this.registry.setTask(name, cronTaskInstance);
    this.registry.setOptions(name, options);
  }

  public initAllTasks() {
    this.logger.debug(`Init all cron tasks`);

    const tasks = this.registry.getTasks();
    for (const [name] of tasks.entries()) {
      this.initCronTask(name, this.registry.getOptions(name));
    }
  }

  private initCronTask(name: string, options: CronOptions) {
    const cronTime = this.registry.getTime(name);

    this.logger.info(`Init task ${name} with ${cronTime}, options ${JSON.stringify(options)}`);

    if (this.scheduler.getCronJobs().has(name)) {
      this.scheduler.deleteCronJob(name);
    }

    this.scheduler.addCronJob(name, new CronJob(
      cronTime,
      async () => {
        await this.runCronTask(name);
      },
      null,
      true,
      this.timezone,
    ));
  }

  private async runCronTask(name: string) {
    if (this.registry.isTaskInProgress(name)) {
      this.logger.warn(
        `Cron task ${name} was interrupted because previous one is still in progress. Consider changing the config or speedup the task`,
      );

      return;
    }

    const useTransactionManager = this.registry.isTransactionEnabled(name);

    if (useTransactionManager) {
      try {
        await lastValueFrom(this.http.post(this.cronItemProcessEndpoint, {
          name,
          secretKey: this.configService.getSecretKeyForInternalRequest(),
        }));
      } catch (error: any) {
        this.logger.error(`Cron ${name}: API failed: ${JSON.stringify(error.response?.data ?? (error.stack ?? error.message))}`);
      }
    } else {
      const cronTask = this.registry.getTask(name);
      await this.cronRunner.processCronTask(this.nonTxDb, name, cronTask);
    }
  }
}
