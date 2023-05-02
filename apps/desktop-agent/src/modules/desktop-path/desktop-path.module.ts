import { Global, Module } from '@nestjs/common';

import { AgentPathService } from '~agent/services';
import { CorePathService } from '~core/services';

import { DesktopPathService } from './desktop-path.service';

@Global()
@Module({
  providers: [{
    provide: AgentPathService,
    useClass: DesktopPathService,
  },
  {
    provide: CorePathService,
    useClass: DesktopPathService,
  }],
  exports: [AgentPathService, CorePathService],
})
export class DesktopPathModule {}
