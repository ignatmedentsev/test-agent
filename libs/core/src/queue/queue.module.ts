import { HttpModule, HttpService } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreConfigService } from '~core/services';

import { DbModule, NonTxDbService } from '../db';
import { LogService } from '../log';

import { QueueManagerService } from './queue-manager.service';
import { QueueController } from './queue.controller';
import { QueueCron } from './queue.cron';
import { Queue } from './queue.entity';
import { QueueExplorer } from './queue.explorer';
import { QueueRegistry } from './queue.registry';
import { QueueRepository } from './queue.repository';
import { QueueRunner } from './queue.runner';
import { QueueService } from './queue.service';

@Global()
@Module({
  imports: [
    DiscoveryModule,
    DbModule,
    HttpModule.register({ timeout: 300000 }), // 5 minutes
    TypeOrmModule.forFeature([Queue, QueueRepository]),
  ],
  controllers: [
    QueueController,
  ],
  providers: [
    QueueCron,
    QueueExplorer,
    QueueRegistry,
    QueueRunner,
    QueueManagerService,
    QueueRepository,
    {
      provide: QueueService,
      inject: [
        NonTxDbService,
        HttpService,
        LogService,
        QueueRegistry,
        QueueRunner,
        QueueRepository,
        CoreConfigService,
      ],
      useFactory: (
        nonTxDb: NonTxDbService,
        http: HttpService,
        logger: LogService,
        registry: QueueRegistry,
        runner: QueueRunner,
        queueRepository: QueueRepository,
        config: CoreConfigService,
      ) => {
        const queueService = new QueueService(nonTxDb, http, logger, registry, runner, queueRepository, config);

        // const queueThreads = await sysVarService.get(nonTxDb, ESysVarName.QUEUE_THREADS);
        // queueService.setParallelThreadsNumbers(queueThreads);

        return queueService;
      },
    },
  ],
  exports: [
    QueueService,
    QueueManagerService,
    TypeOrmModule,
  ],
})
export class QueueModule {}
