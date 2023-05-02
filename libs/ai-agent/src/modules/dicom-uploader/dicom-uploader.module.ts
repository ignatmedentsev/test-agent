import { Module } from '@nestjs/common';

import { DicomAiSenderModule } from '~ai-agent/modules/dicom-ai-sender';
import { FileModule } from '~ai-agent/modules/file';

import { DicomUploaderQueue } from './dicom-uploader.queue';
import { DimsePacsFileUploader } from './dimse-pacs-file-uploader';
import { DimseSenderSettingsUpdater } from './dimse-settings-updater';
import { HttpPacsFileUploader } from './http-pacs-file-uploader';

@Module({
  imports: [
    FileModule,
    DicomAiSenderModule,
  ],
  providers: [
    DicomUploaderQueue,
    DimsePacsFileUploader,
    DimseSenderSettingsUpdater,
    HttpPacsFileUploader,
  ],
})
export class DicomUploaderModule {}
