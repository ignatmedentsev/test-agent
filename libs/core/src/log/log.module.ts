import { Global, Module } from '@nestjs/common';

import { LogRotateCron } from './log-rotate.cron';
import { LogRotateService } from './log-rotate.service';
import { LogService } from './log.service';

@Global()
@Module({
  providers: [
    LogRotateCron,
    LogRotateService,
    LogService,
  ],
  exports: [LogService],
})
export class LogModule {}
