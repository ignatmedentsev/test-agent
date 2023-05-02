import { bootstrap } from '~agent/utils/bootstrap';

import { DESKTOP_APP_HTTP_PORT } from './constants';
import { DesktopAppModule } from './modules/desktop-app';
import { DesktopPathService } from './modules/desktop-path';

void bootstrap(
  DesktopAppModule,
  new DesktopPathService(),
  DESKTOP_APP_HTTP_PORT,
);

