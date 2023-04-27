import { Module } from '@nestjs/common';

import { DicomSenderModule } from '../dicom-sender';
import { PacsModule } from '../pacs';
import { PhiModule } from '../phi';

import { RequestStudyNotesTask } from './request-study-notes.task';
import { SendStudyNotesTask } from './send-study-notes.task';
import { StudyDataService } from './study-data.service';
import { StudyNotesService } from './study-notes.service';

@Module({
  imports: [
    PacsModule,
    PhiModule,
    DicomSenderModule,
  ],
  providers: [
    StudyNotesService,
    SendStudyNotesTask,
    RequestStudyNotesTask,
    StudyDataService,
  ],
  exports: [
    StudyNotesService,
  ],
})
export class StudyNotesModule {}
