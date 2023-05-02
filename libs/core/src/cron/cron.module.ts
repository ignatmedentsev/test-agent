import { HttpModule, HttpService } from '@nestjs/axios';
import type { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';

import { CoreConfigService } from '~core/services';

import { DbModule, NonTxDbService } from '../db';
import { LogService } from '../log';

import { CronController } from './cron.controller';
import { CronExplorer } from './cron.explorer';
import { CronRegistry } from './cron.registry';
import { CronRunner } from './cron.runner';
import { CronService } from './cron.service';

interface CronModuleSettings {
  /**
   * System timezone (default: UTC)
   */
  timezone?: string;
}

/**
 * Custom wrapper above @nestjs/schedule with transactions, preventing overlapping
 * and external cron configuration via sysvar (look the name at constants)
 */
@Module({
  imports: [
    DiscoveryModule,
    DbModule,
    HttpModule.register({ timeout: 300000 }), // 5 minutes
    ScheduleModule.forRoot(),
  ],
})
export class CronModule {
  public static forRoot(settings: CronModuleSettings = {}): DynamicModule {
    return {
      global: true,
      module: CronModule,
      controllers: [
        CronController,
      ],
      providers: [
        CronExplorer,
        CronRegistry,
        CronRunner,
        {
          provide: CronService,
          inject: [
            NonTxDbService,
            CronRunner,
            HttpService,
            LogService,
            SchedulerRegistry,
            CronRegistry,
            CoreConfigService,
          ],
          useFactory: (
            nonTxDb: NonTxDbService,
            runner: CronRunner,
            http: HttpService,
            logger: LogService,
            scheduler: SchedulerRegistry,
            registry: CronRegistry,
            config: CoreConfigService,
          ) => {
            const cronService = new CronService(nonTxDb, runner, http, logger, registry, scheduler, config);

            // const cronTimes = await sysVarService.get(nonTxDb, ESysVarName.CRON_TIMES);
            // cronService.setCronTimes(cronTimes);

            if (settings?.timezone) {
              cronService.setTimezone(settings.timezone);
            }

            return cronService;
          },
        },
      ],
      exports: [CronService],
    };
  }
}
