import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AgentModule } from '~agent/modules/agent';
import { EAgentMode } from '~common/enums';
import { ErrorFilter } from '~core/filter';
import { LogInterceptor } from '~core/interceptors';
import { HEADLESS_APP_HTTPS_PORT } from '~headless-app/constants';

import { HeadlessConfigModule } from '../headless-config';
import { HeadlessPathModule } from '../headless-path';

const packageJson = require('../../../../../../package.json');

@Module({
  imports: [
    HeadlessPathModule,
    HeadlessConfigModule.forRoot(),
    AgentModule.forRoot({
      version: packageJson.version,
      port: HEADLESS_APP_HTTPS_PORT,
      mode: EAgentMode.KUBERNETES,
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LogInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
  ],
})
export class HeadlessAppModule {}
