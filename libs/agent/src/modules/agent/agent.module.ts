import type { DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { AgentApiClientModule, AgentApiClientService } from '~agent/modules/agent-api-client';
import { AgentConfigService, AgentPathService } from '~agent/services';
import type { ETaskType } from '~common/enums';
import type { TAgentModuleOptions, TAgentTaskFunction } from '~common/types';
import { ApiModule } from '~core/api';
import { AuthModule, AuthService } from '~core/auth';
import { ChildProcessModule } from '~core/child-process';
import { CronModule } from '~core/cron';
import { DbModule } from '~core/db';
import { TxMiddleware } from '~core/db/tx.middleware';
import { HttpsModule } from '~core/https/https.module';
import { LogModule, LogService } from '~core/log';
import { QueueModule } from '~core/queue';
import { SocketClientService, SocketModule } from '~core/socket';
import { SysVarService, SysVarModule } from '~core/sysvar';
import { TaskModule } from '~core/task';

import { DeviceModule, DeviceService } from '../device';
import { DicomUploaderModule } from '../dicom-uploader';
import { MedcloudModule } from '../medcloud';
import { OrganizationModule } from '../organization';
import { PacsModule } from '../pacs';
import { PhiModule } from '../phi';
import { RootModule } from '../root';
import { StudyNotesModule } from '../study-notes';

import { AgentInitService } from './agent-init.service';

@Module({
  imports: [
    AgentApiClientModule,
    ScheduleModule.forRoot(),
    ChildProcessModule,
    DbModule,
    LogModule,
    AuthModule,
    DeviceModule,
    SysVarModule.forRoot(),
    DicomUploaderModule,
    HttpsModule,
    OrganizationModule,
    CronModule.forRoot(),
    QueueModule,
    ApiModule,
    PacsModule,
    PhiModule,
    MedcloudModule,
    RootModule,
    SocketModule,
    TaskModule.forRoot<ETaskType, TAgentTaskFunction<ETaskType>>(),
    StudyNotesModule,
  ],
})
export class AgentModule implements NestModule {
  public static forRoot(options: TAgentModuleOptions): DynamicModule {
    return {
      module: AgentModule,
      global: true,
      exports: [AgentInitService],
      providers: [{
        provide: AgentInitService,
        inject: [
          AgentApiClientService,
          AuthService,
          AgentConfigService,
          DeviceService,
          SysVarService,
          HttpAdapterHost,
          LogService,
          SocketClientService,
          AgentPathService,
        ],
        useFactory: (
          agentApiClientService: AgentApiClientService,
          authService: AuthService,
          configService: AgentConfigService,
          deviceService: DeviceService,
          sysVarService: SysVarService,
          httpAdapterHost: HttpAdapterHost,
          logger: LogService,
          socketClientService: SocketClientService,
          agentPathService: AgentPathService,
        ) => {
          return new AgentInitService(
            agentApiClientService,
            authService,
            configService,
            deviceService,
            sysVarService,
            httpAdapterHost,
            logger,
            socketClientService,
            agentPathService,
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
