import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

import type { AgentPathService } from '~agent/services';
import { CronService } from '~core/cron';
import { LogService } from '~core/log';
import { QueueService } from '~core/queue';

export async function bootstrap(module: any, agentPathService: AgentPathService, httpPort: number) {
  const appServer = await NestFactory.create(
    module,
    new ExpressAdapter(express()),
    { logger: new LogService(agentPathService, 'NEST') },
  );
  appServer.enableCors({
    origin: (origin, callback) => {
      if (origin === 'http://localhost:4201' || typeof origin === 'undefined') {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },

  });

  // Starts listening for shutdown hooks
  appServer.enableShutdownHooks();

  await appServer.listen(httpPort, async () => {
    // TODO: it would be nice to have a lifecycle event for this
    await appServer.get(QueueService).runAllQueues();
    appServer.get(CronService).initAllTasks();
  });
}
