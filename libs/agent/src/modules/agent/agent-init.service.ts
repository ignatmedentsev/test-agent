import type { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Injectable, HttpAdapterHost } from '@nestjs/common';
import fs from 'fs';
import type { Server } from 'https';
import https from 'https';
import os from 'os';
import type { Subscription } from 'rxjs';
import util from 'util';

import { verifyHttpsOptions } from '~agent/utils/https';
import type { EAgentMode } from '~common/enums';
import { EPresenceStatus } from '~common/enums';
import { ESysVarName } from '~common/enums';
import { EAgentOS } from '~common/enums';
import { ApiClientService } from '~core/api-client';
import { AuthService } from '~core/auth';
import { LogService } from '~core/log';
import { SocketClientService } from '~core/socket';
import { SysVarService } from '~core/sysvar';

import { AgentConfigService, PathService } from '../../services';
import { DeviceService } from '../device';

import { GIT_COMMIT_HASH } from './agent.const';
import { TAgentModuleOptions } from './agent.types';

@Injectable()
export class AgentInitService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly version: string;
  private readonly mode: EAgentMode;
  private readonly osEnv: EAgentOS;
  private readonly httpsListeningPort: number;
  private httpsServer: Server;

  private isConnectedSubscription: Subscription;
  constructor(
    private readonly apiClientService: ApiClientService,
    private readonly authService: AuthService,
    private readonly configService: AgentConfigService,
    private readonly deviceService: DeviceService,
    private readonly sysVarService: SysVarService,
    private readonly adapterHost: HttpAdapterHost,

    private readonly logger: LogService,
    private readonly socketClientService: SocketClientService,
    private readonly pathService: PathService,

    options: TAgentModuleOptions,
  ) {
    this.version = options.version;
    this.mode = options.mode;
    this.osEnv = EAgentOS[os.platform().toUpperCase() as EAgentOS];
    const gitCommit: string = GIT_COMMIT_HASH;
    this.version = gitCommit
      ? `${options.version}_${gitCommit.slice(-6)}`
      : options.version;
    this.httpsListeningPort = options.port;
  }

  public async onApplicationBootstrap() {
    await this.createDirectories();
    this.logger.info(`Application is running with NODE_ENV ${process.env.NODE_ENV ?? 'NOT SET'}`);

    this.isConnectedSubscription = this.socketClientService.isConnected.subscribe({
      next: async (isConnected) => {
        if (isConnected) {
          await this.initAgent();
        }
      },
    });
  }

  public onApplicationShutdown() {
    if (this.isConnectedSubscription) {
      this.isConnectedSubscription.unsubscribe();
    }
  }

  public async initAgent() {
    const storedKey = this.configService.getKey();
    const agentUUID = await this.sysVarService.get(ESysVarName.AGENT_UUID);

    if (storedKey) {
      try {
        const { key, devices, uuid, httpsOptions, publicPacsServer } = await this.apiClientService.agentAuth(
          storedKey,
          agentUUID,
          this.version,
          this.osEnv,
          this.mode,
        );

        this.configService.setMarketplacePublicPacs(publicPacsServer);
        if (uuid && agentUUID !== uuid) {
          await this.sysVarService.set(ESysVarName.AGENT_UUID, uuid);
        }

        await this.authService.login(key);
        this.deviceService.setDevices(devices);
        this.socketClientService.emitPresenceStatus(EPresenceStatus.ONLINE);

        const validateResult = verifyHttpsOptions(httpsOptions);

        if (!validateResult.success) {
          throw new Error(validateResult.error);
        }

        if (!this.httpsServer?.listening) {
          this.httpsServer = https.createServer(httpsOptions, this.adapterHost.httpAdapter.getInstance());
          this.httpsServer.listen(this.httpsListeningPort);
        }

        return { key, devices, httpsOptions };
      } catch (error) {
        let errorMessage = 'Error while initializing application: ';
        if (error instanceof Error) {
          errorMessage += `${error.name} ${error.message}`;
        } else {
          errorMessage += util.inspect(error);
        }

        this.logger.error(errorMessage);
      }
    }
  }

  public getVersion() {
    return this.version;
  }

  private async createDirectories() {
    const directories = [
      this.pathService.getPathToTemp(),
      this.pathService.getPathToLogs(),
    ];
    for (const directory of directories) {
      if (!fs.existsSync(directory)) {
        await fs.promises.mkdir(directory);
      }
    }
  }
}
