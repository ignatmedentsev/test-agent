import type { DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { AiAgentApiClientService, AiAgentApiClientModule } from '~ai-agent/modules/ai-agent-api-client';
import { DicomUploaderModule } from '~ai-agent/modules/dicom-uploader';
import { OrganizationModule } from '~ai-agent/modules/organization';
import { PacsModule } from '~ai-agent/modules/pacs';
import { RootModule } from '~ai-agent/modules/root';
import { VetAiModule } from '~ai-agent/modules/vet-ai';
import { AiAgentConfigService, AiAgentPathService } from '~ai-agent/services';
import type { ETaskType } from '~common/enums';
import type { TAgentModuleOptions, TAgentTaskFunction } from '~common/types';
import { ApiModule } from '~core/api';
import { AuthModule, AuthService } from '~core/auth';
import { ChildProcessModule } from '~core/child-process';
import { CronModule } from '~core/cron';
import { DbModule, TxMiddleware } from '~core/db';
import { HttpsModule } from '~core/https/https.module';
import { LogModule, LogService } from '~core/log';
import { QueueModule } from '~core/queue';
import { SocketModule, SocketClientService } from '~core/socket';
import { SysVarModule, SysVarService } from '~core/sysvar';
import { TaskModule } from '~core/task';

import { AiAgentInitService } from './ai-agent-init.service';

@Module({
  imports: [
    AiAgentApiClientModule,
    ScheduleModule.forRoot(),
    ChildProcessModule,
    DbModule,
    LogModule,
    AuthModule,
    DicomUploaderModule,
    SysVarModule.forRoot(),
    HttpsModule,
    OrganizationModule,
    CronModule.forRoot(),
    QueueModule,
    ApiModule,
    PacsModule,
    RootModule,
    SocketModule,
    TaskModule.forRoot<ETaskType, TAgentTaskFunction<ETaskType>>(),
    VetAiModule,
  ],
})
export class AiAgentModule implements NestModule {
  public static forRoot(options: TAgentModuleOptions): DynamicModule {
    return {
      module: AiAgentModule,
      global: true,
      exports: [AiAgentInitService],
      providers: [{
        provide: AiAgentInitService,
        inject: [
          AiAgentApiClientService,
          AuthService,
          AiAgentConfigService,
          SysVarService,
          HttpAdapterHost,
          LogService,
          SocketClientService,
          AiAgentPathService,
        ],
        useFactory: (
          aiAgentApiClientService: AiAgentApiClientService,
          authService: AuthService,
          configService: AiAgentConfigService,
          sysVarService: SysVarService,
          httpAdapterHost: HttpAdapterHost,
          logger: LogService,
          socketClientService: SocketClientService,
          aiAgentPathService: AiAgentPathService,
        ) => {
          return new AiAgentInitService(
            aiAgentApiClientService,
            authService,
            configService,
            sysVarService,
            httpAdapterHost,
            logger,
            socketClientService,
            aiAgentPathService,
            options,
          );
        },
      }],
    };
  }

  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TxMiddleware)
      .forRoutes('/'); // apply for all agent APIs, do not change to '*' - it doesn't work
  }
}
