import type { OnApplicationBootstrap } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import fs from 'fs';
import { combineLatest } from 'rxjs';

import { AgentConfigService, AgentPathService } from '~agent/services';
import { EQueueType } from '~common/enums';
import { AuthService } from '~core/auth';
import { NonTxDbService } from '~core/db';
import { LogService } from '~core/log';
import { QueueManagerService, QueueService } from '~core/queue';

import { FileService } from '../file';
import { OrganizationService } from '../organization';

import { DimseScp } from './dimse-scp';

const dcmjsDimse = require('dcmjs-dimse');

const { Server } = dcmjsDimse;

@Injectable()
export class PacsService implements OnApplicationBootstrap {
  // dcmjs-dimse has incorrectly types for Server
  private pacsServer: any;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: AgentConfigService,
    private readonly db: NonTxDbService,
    private readonly fileService: FileService,
    private readonly logger: LogService,
    private readonly organizationService: OrganizationService,
    private readonly pathService: AgentPathService,
    private readonly queueManager: QueueManagerService,
    private readonly queueService: QueueService,
  ) {
    logger.setContext(this.constructor.name);
  }

  public onApplicationBootstrap() {
    combineLatest({
      isAuthenticated: this.authService.isAuth,
      isOrganizationServiceInit: this.organizationService.isOrganizationServiceInit,
    })
      .subscribe((async value => {
        if (value.isAuthenticated && value.isOrganizationServiceInit && this.organizationService.isIF()) {
          this.startPacsServer();
        } else {
          await this.stopPacsServer();
        }
      }));
  }

  public startPacsServer() {
    if (!this.pacsServer) {
      const pacsOptions = this.configService.getPacsOptions();

      if (!pacsOptions) {
        throw new Error('Missing config for DICOM PACS server');
      }

      if (!pacsOptions.storagePath) {
        throw new Error('StoragePath is not specified for DICOM in config');
      }

      const storagePath = pacsOptions.storagePath;
      if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath);
      }

      this.pacsServer = new Server(DimseScp);

      this.pacsServer.on('networkError', (error: Error) => {
        this.logger.error(`Network error: ${error.message}`);
      });

      this.pacsServer.listen(pacsOptions.port, {
        ...pacsOptions.scp,
        configService: this.configService,
        db: this.db,
        fileService: this.fileService,
        logger: new LogService(this.pathService, DimseScp.name),
        queueService: this.queueService,
      });

      this.logger.info(`DICOM PACS server with aet: "${pacsOptions.aet}" listening on port: ${pacsOptions.port}`);
    }
  }

  public async stopPacsServer() {
    if (this.pacsServer) {
      this.pacsServer.close();
      this.pacsServer = null;

      await this.queueManager.pauseQueue(EQueueType.DICOM_PROCESSOR, 'common');

      this.logger.info(`DICOM PACS server stopped`);
    }
  }
}
