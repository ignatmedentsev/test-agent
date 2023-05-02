import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AiAgentModule } from '~ai-agent/modules/ai-agent';
import { AI_APP_HTTPS_PORT } from '~ai-app/constants';
import { EAgentMode } from '~common/enums';
import { ErrorFilter } from '~core/filter';
import { LogInterceptor } from '~core/interceptors';

import { AiConfigModule } from '../ai-config';
import { AiPathModule } from '../ai-path';

const packageJson = require('../../../../../../package.json');

@Module({
  imports: [
    AiPathModule,
    AiConfigModule,
    AiAgentModule.forRoot({
      version: packageJson.version,
      port: AI_APP_HTTPS_PORT,
      mode: EAgentMode.AI,
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
export class AiAppModule {}
