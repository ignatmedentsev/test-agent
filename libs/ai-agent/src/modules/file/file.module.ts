import { Module } from '@nestjs/common';

import { CheckLocalFileExistenceTask } from './check-local-file-existence.task';
import { FileService } from './file.service';

@Module({
  providers: [
    FileService,
    CheckLocalFileExistenceTask,
  ],
  exports: [
    FileService,
  ],
})
export class FileModule { }
