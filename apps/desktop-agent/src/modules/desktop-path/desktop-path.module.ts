import { Global, Module } from '@nestjs/common';

import { PathService } from '~agent/services';

import { DesktopPathService } from './desktop-path.service';

@Global()
@Module({
  providers: [{
    provide: PathService,
    useClass: DesktopPathService,
  }],
  exports: [PathService],
})
export class DesktopPathModule {}
