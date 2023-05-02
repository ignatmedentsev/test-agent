import { Global, Module } from '@nestjs/common';

import { AgentPathService } from '~agent/services';
import { CorePathService } from '~core/services';

import { HeadlessPathService } from './headless-path.service';

@Global()
@Module({
  providers: [{
    provide: AgentPathService,
    useClass: HeadlessPathService,
  },
  {
    provide: CorePathService,
    useClass: HeadlessPathService,
  }],
  exports: [AgentPathService, CorePathService],
})
export class HeadlessPathModule {}
