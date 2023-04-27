import { Module } from '@nestjs/common';

import { DicomSenderModule } from '~agent/modules/dicom-sender';
import { FileModule } from '~agent/modules/file';

import { DicomUploaderQueue } from './dicom-uploader.queue';
import { DimsePacsFileUploader } from './dimse-pacs-file-uploader';
import { DimseSenderSettingsUpdater } from './dimse-settings-updater';
import { HttpPacsFileUploader } from './http-pacs-file-uploader';

@Module({
  imports: [
    FileModule,
    DicomSenderModule,
  ],
  providers: [
    DicomUploaderQueue,
    DimsePacsFileUploader,
    DimseSenderSettingsUpdater,
    HttpPacsFileUploader,
  ],
})
export class DicomUploaderModule {}
