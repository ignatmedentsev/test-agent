import { Module } from '@nestjs/common';

import { FileModule } from '~agent/modules/file';
import { OrganizationModule } from '~agent/modules/organization';
import { PhiModule } from '~agent/modules/phi';

import { DicomProcessorQueue } from './dicom-processor';
import { PacsService } from './pacs.service';
import { ParseDicomService } from './parse-dicom.service';

@Module({
  imports: [
    FileModule,
    OrganizationModule,
    PhiModule,
  ],
  providers: [
    DicomProcessorQueue,
    PacsService,
    ParseDicomService,
  ],
  exports: [
    PacsService,
    ParseDicomService,
  ],
})
export class PacsModule { }
