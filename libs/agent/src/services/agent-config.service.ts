import type { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';

import { platformUrls } from '~common/constants';
import { EPacsFileUploaderType } from '~common/enums';
import type { IHttpRetryOptions, IPacsOptions, IPacsServer, IStorescu } from '~common/interfaces';
import type { TQueueOptions } from '~common/types';

import type { PathService } from './path.service';

export abstract class AgentConfigService {
  protected key: string;
  protected secretKeyForInternalRequest: string; // Using for internal api call
  protected httpPort: number;
  protected httpsPort: number;

  private marketplacePublicPacs: IPacsServer;

  constructor(
    protected readonly configService: ConfigService,
    protected readonly pathService: PathService,
  ) {
    this.secretKeyForInternalRequest = crypto.createHash('sha1').update(uuid()).digest('hex');
  }

  public abstract setKey(key: string): Promise<void>;

  public getApiUrl() {
    return this.configService.get<string>('apiUrl') ?? platformUrls.prod;
  }

  public getKey() {
    return this.key ?? this.configService.get<string>('key');
  }

  public getSecretKeyForInternalRequest() {
    return this.secretKeyForInternalRequest;
  }

  public getQueueOptions() {
    return this.configService.get<TQueueOptions>('queues', { infer: true }) as TQueueOptions;
  }

  public getPacsOptions() {
    return this.configService.get<IPacsOptions>('pacs', { infer: true }) as IPacsOptions;
  }

  public getHttpRetryOptions() {
    return this.configService.get<IHttpRetryOptions>('httpRetryOptions', { infer: true }) as IHttpRetryOptions;
  }

  public getStorescuOptions() {
    return this.configService.get<IStorescu>('storescu', { infer: true }) as IStorescu;
  }

  public getHttpTimeout() {
    return this.configService.get<number>('httpRequestTimeout') ?? 30000;
  }

  public getHttpsEnforced() {
    return this.configService.get<boolean>('httpsEnforced');
  }

  public getHttpPort() {
    return this.httpPort;
  }

  public getHttpsPort() {
    return this.httpsPort;
  }

  public getPacsFileUploaderType() {
    return this.configService.get<EPacsFileUploaderType>('pacsFileUploadProtocol') ?? EPacsFileUploaderType.HTTP;
  }

  public getMarketplacePublicPacs() {
    return this.marketplacePublicPacs;
  }

  public setMarketplacePublicPacs(pacsServer: IPacsServer) {
    this.marketplacePublicPacs = pacsServer;
  }

  public allowInsecureDimsePacsFileUpload() {
    return this.configService.get<boolean>('allowInsecureDimsePacsFileUpload') ?? false;
  }

  public getCheckTlsTimeout() {
    return this.configService.get<number>('checkTlsTimeout') ?? 10000;
  }

  public getAutoUpdateOption() {
    return this.configService.get<boolean>('autoUpdate') ?? true;
  }
}
