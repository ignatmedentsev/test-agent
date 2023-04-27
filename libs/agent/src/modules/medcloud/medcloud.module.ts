import { Module } from '@nestjs/common';

import { DeviceModule } from '~agent/modules/device';

import { MedcloudController } from './medcloud.controller';
import { MedcloudService } from './medcloud.service';

@Module({
  imports: [DeviceModule],
  providers: [MedcloudService],
  controllers: [MedcloudController],
})
export class MedcloudModule {}
