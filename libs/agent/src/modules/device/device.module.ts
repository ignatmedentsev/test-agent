import { Module } from '@nestjs/common';

import { DeviceGuard } from './device.guard';
import { DeviceService } from './device.service';

@Module({
  providers: [DeviceService, DeviceGuard],
  exports: [DeviceService, DeviceGuard],
})
export class DeviceModule {}
