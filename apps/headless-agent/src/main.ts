
import { bootstrap } from '~agent/utils/bootstrap';
import { HEADLESS_APP_HTTP_PORT } from '~common/constants';

import { HeadlessAppModule } from './modules/headless-app';
import { HeadlessPathService } from './modules/headless-path';

void bootstrap(
  HeadlessAppModule,
  new HeadlessPathService(),
  HEADLESS_APP_HTTP_PORT,
);
