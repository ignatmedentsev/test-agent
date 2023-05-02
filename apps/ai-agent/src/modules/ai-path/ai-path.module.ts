import { Global, Module } from '@nestjs/common';

import { AiAgentPathService } from '~ai-agent/services';
import { CorePathService } from '~core/services';

import { AiPathService } from './ai-path.service';

@Global()
@Module({
  providers: [{
    provide: AiAgentPathService,
    useClass: AiPathService,
  },
  {
    provide: CorePathService,
    useClass: AiPathService,
  }],
  exports: [AiAgentPathService, CorePathService],
})
export class AiPathModule {}
