import { bootstrap } from '~ai-agent/utils/bootstrap';

import { AI_APP_HTTP_PORT } from './constants';
import { AiAppModule } from './modules/ai-app';
import { AiPathService } from './modules/ai-path';

void bootstrap(
  AiAppModule,
  new AiPathService(),
  AI_APP_HTTP_PORT,
);
