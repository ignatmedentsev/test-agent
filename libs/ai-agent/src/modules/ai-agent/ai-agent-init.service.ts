import type { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Injectable, HttpAdapterHost } from '@nestjs/common';
import fs from 'fs';
import type { Server } from 'https';
import https from 'https';
import os from 'os';
import type { Subscription } from 'rxjs';
import util from 'util';

import { AiAgentApiClientService } from '~ai-agent/modules/ai-agent-api-client';
import { AiAgentConfigService, AiAgentPathService } from '~ai-agent/services';
import type { EAgentMode } from '~common/enums';
import { EPresenceStatus } from '~common/enums';
import { ESysVarName } from '~common/enums';
import { EAgentOS } from '~common/enums';
import { TAgentModuleOptions } from '~common/types';
import { verifyHttpsOptions } from '~common/utils/https';
import { AuthService } from '~core/auth';
import { LogService } from '~core/log';
import { SocketClientService } from '~core/socket';
import { SysVarService } from '~core/sysvar';

import { GIT_COMMIT_HASH } from './ai-agent.const';

@Injectable()
export class AiAgentInitService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly version: string;
  private readonly mode: EAgentMode;
  private readonly osEnv: EAgentOS;
  private readonly httpsListeningPort: number;
  private httpsServer: Server;

  private isConnectedSubscription: Subscription;
  constructor(
    private readonly aiAgentApiClientService: AiAgentApiClientService,
    private readonly authService: AuthService,
    private readonly configService: AiAgentConfigService,
    private readonly sysVarService: SysVarService,
    private readonly adapterHost: HttpAdapterHost,

    private readonly logger: LogService,
    private readonly socketClientService: SocketClientService,
    private readonly aiAgentPathService: AiAgentPathService,

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
        const { key, uuid, httpsOptions, publicPacsServer } = await this.aiAgentApiClientService.agentAuth(
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
        this.socketClientService.emitPresenceStatus(EPresenceStatus.ONLINE);

        const validateResult = verifyHttpsOptions(httpsOptions);

        if (!validateResult.success) {
          throw new Error(validateResult.error);
        }

        if (!this.httpsServer?.listening) {
          this.httpsServer = https.createServer(httpsOptions, this.adapterHost.httpAdapter.getInstance());
          this.httpsServer.listen(this.httpsListeningPort);
        }

        return { key, httpsOptions };
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
      this.aiAgentPathService.getPathToTemp(),
      this.aiAgentPathService.getPathToLogs(),
    ];
    for (const directory of directories) {
      if (!fs.existsSync(directory)) {
        await fs.promises.mkdir(directory);
      }
    }
  }
}
