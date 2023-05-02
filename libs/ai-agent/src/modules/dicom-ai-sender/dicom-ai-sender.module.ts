import { Module } from '@nestjs/common';

import { FileModule } from '~ai-agent/modules/file';
import { VetAiModule } from '~ai-agent/modules/vet-ai';

import { DcmJsResponseFormatter } from './dcmjs-response-formatter.service';
import { DicomAiSenderTask } from './dicom-ai-sender.task';
import { DicomPushSenderService } from './dicom-push-sender.service';

@Module({
  imports: [
    FileModule,
    VetAiModule,
  ],
  providers: [
    DicomPushSenderService,
    DicomAiSenderTask,
    DcmJsResponseFormatter,
  ],
  exports: [DicomPushSenderService],
})
export class DicomAiSenderModule {}
