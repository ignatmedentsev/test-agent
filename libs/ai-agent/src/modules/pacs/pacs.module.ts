import { Module } from '@nestjs/common';

import { DicomAiSenderModule } from '~ai-agent/modules/dicom-ai-sender';
import { FileModule } from '~ai-agent/modules/file';
import { OrganizationModule } from '~ai-agent/modules/organization';

import { DicomProcessorQueue } from './dicom-processor';
import { PacsService } from './pacs.service';
import { ParseDicomService } from './parse-dicom.service';

@Module({
  imports: [
    DicomAiSenderModule,
    FileModule,
    OrganizationModule,
  ],
  providers: [
    PacsService,
    ParseDicomService,
    DicomProcessorQueue,
  ],
  exports: [
    PacsService,
    ParseDicomService,
  ],
})
export class PacsModule { }
