import { Global, Module } from '@nestjs/common';

import { ChildProcessService } from './child-process.service';

@Global()
@Module({
  providers: [ChildProcessService],
  exports: [ChildProcessService],
})
export class ChildProcessModule {}
