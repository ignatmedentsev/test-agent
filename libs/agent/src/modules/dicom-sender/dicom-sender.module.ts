import { Module } from '@nestjs/common';

import { FileModule } from '~agent/modules/file';
import { PhiModule } from '~agent/modules/phi';

import { CheckPacsServerConnectionTask } from './check-pacs-server-connection.task';
import { DcmJsResponseFormatter } from './dcmjs-response-formatter.service';
import { DicomSenderLocalTask } from './dicom-sender-local.task';
import { DicomSenderPlatformTask } from './dicom-sender-platform.task';
import { DicomSenderService } from './dicom-sender.service';

@Module({
  imports: [
    FileModule,
    PhiModule,
  ],
  providers: [
    CheckPacsServerConnectionTask,
    DicomSenderService,
    DicomSenderPlatformTask,
    DicomSenderLocalTask,
    DcmJsResponseFormatter,
  ],
  exports: [DicomSenderService],
})
export class DicomSenderModule {}
