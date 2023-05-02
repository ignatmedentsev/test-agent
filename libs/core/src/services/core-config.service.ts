import type { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';

import { platformUrls } from '~common/constants';
import { EPacsFileUploaderType } from '~common/enums';
import type { IHttpRetryOptions, IPacsOptions, IPacsServer, IStorescu } from '~common/interfaces';
import type { TQueueOptions } from '~common/types';

export abstract class CoreConfigService {
  protected key: string;
  protected secretKeyForInternalRequest: string; // Using for internal api call
  protected httpPort: number;
  protected httpsPort: number;

  private marketplacePublicPacs: IPacsServer;

  constructor(
    protected readonly configService: ConfigService,
  ) {
    this.secretKeyForInternalRequest = crypto.createHash('sha1').update(uuid()).digest('hex');
  }

  public abstract setKey(key: string): Promise<void>;

  public getPlatformApiUrl() {
    return this.configService.get<string>('apiUrl') ?? platformUrls.prod;
  }

  public getKey() {
    return this.key ?? this.configService.get<string>('key');
  }

  public getSecretKeyForInternalRequest() {
    return this.secretKeyForInternalRequest;
  }

  public getQueueOptions(): TQueueOptions {
    return this.configService.get<TQueueOptions>('queues', { infer: true });
  }

  public getPacsOptions(): IPacsOptions {
    return this.configService.get<IPacsOptions>('pacs', { infer: true });
  }

  public getHttpRetryOptions(): IHttpRetryOptions {
    return this.configService.get<IHttpRetryOptions>('httpRetryOptions', { infer: true });
  }

  public getStorescuOptions(): IStorescu {
    return this.configService.get<IStorescu>('storescu', { infer: true });
  }

  public getHttpTimeout(): number {
    return this.configService.get<number>('httpRequestTimeout', { infer: true }) ?? 30000;
  }

  public getHttpsEnforced(): boolean {
    return this.configService.get<boolean>('httpsEnforced', { infer: true });
  }

  public getHttpPort() {
    return this.httpPort;
  }

  public getHttpsPort() {
    return this.httpsPort;
  }

  public getPacsFileUploaderType(): EPacsFileUploaderType {
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
}
