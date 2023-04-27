import { Global, Module } from '@nestjs/common';

import { PathService } from '~agent/services';

import { HeadlessPathService } from './headless-path.service';

@Global()
@Module({
  providers: [{
    provide: PathService,
    useClass: HeadlessPathService,
  }],
  exports: [PathService],
})
export class HeadlessPathModule {}
