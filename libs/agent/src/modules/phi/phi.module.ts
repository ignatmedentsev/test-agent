import { Module } from '@nestjs/common';

import { DeviceModule } from '~agent/modules/device';

import { PhiSender } from './phi-sender.queue';
import { PhiController } from './phi.controller';
import { PhiValidationPipe } from './phi.pipe';
import { PhiService } from './phi.service';
import { RequestPhiTask } from './request-phi.task';
import { UpdatePhiDataTask } from './update-phi-data.task';

@Module({
  imports: [DeviceModule],
  controllers: [PhiController],
  providers: [
    PhiService,
    PhiValidationPipe,
    RequestPhiTask,
    PhiSender,
    UpdatePhiDataTask,
  ],
  exports: [PhiService],
})
export class PhiModule {}
