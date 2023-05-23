import { Module } from '@nestjs/common';

import { FileModule } from '~ai-agent/modules/file';
import { VetAiModule } from '~ai-agent/modules/vet-ai';

import { CheckPacsServerConnectionTask } from './check-pacs-server-connection';
import { DcmJsResponseFormatter } from './dcmjs-response-formatter.service';
import { DicomAiSenderTask } from './dicom-ai-sender.task';
import { DicomPushSenderService } from './dicom-push-sender.service';

@Module({
  imports: [
    FileModule,
    VetAiModule,
  ],
  providers: [
    CheckPacsServerConnectionTask,
    DicomPushSenderService,
    DicomAiSenderTask,
    DcmJsResponseFormatter,
  ],
  exports: [DicomPushSenderService],
})
export class DicomAiSenderModule {}
