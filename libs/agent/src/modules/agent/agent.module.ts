import type { DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { HttpsModule } from '~agent/modules/https/https.module';
import type { ETaskType } from '~common/enums';
import type { TAgentTaskFunction } from '~common/types';
import { ApiModule } from '~core/api';
import { ApiClientModule, ApiClientService } from '~core/api-client';
import { AuthModule, AuthService } from '~core/auth';
import { ChildProcessModule } from '~core/child-process';
import { CronModule } from '~core/cron';
import { DbModule } from '~core/db';
import { TxMiddleware } from '~core/db/tx.middleware';
import { LogModule, LogService } from '~core/log';
import { QueueModule } from '~core/queue';
import { SocketClientService, SocketModule } from '~core/socket';
import { SysVarService, SysVarModule } from '~core/sysvar';
import { TaskModule } from '~core/task';

import { AgentConfigService, PathService } from '../../services';
import { DeviceModule, DeviceService } from '../device';
import { DicomUploaderModule } from '../dicom-uploader';
import { MedcloudModule } from '../medcloud';
import { OrganizationModule } from '../organization';
import { PacsModule } from '../pacs';
import { PhiModule } from '../phi';
import { RootModule } from '../root';
import { StudyNotesModule } from '../study-notes';

import { AgentInitService } from './agent-init.service';
import type { TAgentModuleOptions } from './agent.types';

@Module({
  imports: [
    ApiClientModule,
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
          ApiClientService,
          AuthService,
          AgentConfigService,
          DeviceService,
          SysVarService,
          HttpAdapterHost,
          LogService,
          SocketClientService,
          PathService,
        ],
        useFactory: (
          apiClientService: ApiClientService,
          authService: AuthService,
          configService: AgentConfigService,
          deviceService: DeviceService,
          sysVarService: SysVarService,
          httpAdapterHost: HttpAdapterHost,
          logger: LogService,
          socketClientService: SocketClientService,
          pathService: PathService,
        ) => {
          return new AgentInitService(
            apiClientService,
            authService,
            configService,
            deviceService,
            sysVarService,
            httpAdapterHost,
            logger,
            socketClientService,
            pathService,
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
