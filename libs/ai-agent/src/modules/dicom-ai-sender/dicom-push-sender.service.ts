/* eslint-disable @typescript-eslint/indent */

import { Injectable } from '@nestjs/common';
import type { responses } from 'dcmjs-dimse';
import { Dataset, requests, constants, Client } from 'dcmjs-dimse';
import type EventEmitter from 'events';
import tls from 'tls';

import { AiAgentConfigService } from '~ai-agent/services';
import { EAiSendType } from '~common/enums';
import type { IPacsServer } from '~common/interfaces';
import type { TPingResponse, TSendPlatformDicomPayload } from '~common/types';
import { LogService } from '~core/log';

import { DcmJsResponseFormatter } from './dcmjs-response-formatter.service';
import type { IDicomAiSender } from './dicom-ai-sender.interfaces';
import type { TAssociationRejectResult, TDcmjsScuOptions } from './dicom-sender.types';

const DEFAULT_SOURCE_AET = 'NANOX';

const { Status } = constants;

type TDimseOptions = {
  allowInsecure?: boolean,
  checkTls?: boolean,
}

const { CStoreRequest, CEchoRequest } = requests;

type Request = requests.CStoreRequest | requests.CEchoRequest;
type TResponseType<T extends Request> =
  T extends requests.CStoreRequest ? responses.CStoreResponse :
  T extends requests.CEchoRequest ? responses.CEchoResponse :
  never;

const DEFAULT_DIMSE_OPTIONS: TDimseOptions = { allowInsecure: true, checkTls: false };

@Injectable()
export class DicomPushSenderService implements IDicomAiSender {
  constructor(
    private readonly dcmJsResponseFormatter: DcmJsResponseFormatter,
    private readonly logger: LogService,
    private readonly configService: AiAgentConfigService,
  ) {
    logger.setContext(this.constructor.name);
  }

  public async sendDicomToAi(receivedFilePath: string, payload: TSendPlatformDicomPayload) {
    const {
      pacsServer,
      examId,
      filePath,
      pacsFileId,
      aiDispatchId,
      aiReportId,
      scanId,
    } = payload;

    this.logger.debug([
      `Sending exam #${examId}`,
      pacsFileId ? `, PACS file #${pacsFileId}` : '',
      aiDispatchId ? `, AI dispatch #${aiDispatchId}` : '',
      aiReportId ? `, AI report #${aiReportId}` : '',
      scanId ? `, scan #${scanId}` : '',
      ` sending: '${filePath}'`,
    ].join(''));

    let result = 'success';

    await this.performCEcho(pacsServer);
    await this.sendDicomFile(receivedFilePath, pacsServer);

    this.logger.debug([
      `Sent exam #${examId}`,
      pacsFileId ? `, PACS file #${pacsFileId}` : '',
      aiDispatchId ? `, AI dispatch #${aiDispatchId}` : '',
      aiReportId ? `, AI report #${aiReportId}` : '',
      scanId ? `, scan #${scanId}` : '',
      ` result: ${result}`,
    ].join(''));
  }

  public async sendDicomFile(localFilePath: string, pacsServer: IPacsServer, dimseOptions?: TDimseOptions) {
    const dicomDataset = Dataset.fromFile(localFilePath);

    if (!dicomDataset) {
      throw new Error(`No dataset found`);
    }
    await this.performCStore(dicomDataset, pacsServer, dimseOptions);
  }

  public async echo(pacsServer: IPacsServer, dimseOptions?: TDimseOptions) {
    await this.performCEcho(pacsServer, dimseOptions);
  }

  public async pingPacsServer(pacsServer: IPacsServer) {
    const pingResponse: TPingResponse = {
      type: 'info',
      message: `Checking PACS server ${pacsServer.destinationAet}@${pacsServer.host}:${pacsServer.port}`
      + ` connection is not supported by agent #${pacsServer.agent?.id}`,
    };

    if (this.configService.getAiSendType() !== EAiSendType.PUSH) {
      return pingResponse;
    }

    try {
      await new Promise<string>((resolve, reject) => {
        const client = (new Client()) as Client & EventEmitter;
        const request = new CEchoRequest();

        client.addRequest(request);

        request.on('response', (response: responses.CEchoResponse) => {
          const status = response.getStatus();
          if (status === Status.Success) {
            resolve('');
          } else {
            reject(`Unsuccessful response status: ${this.dcmJsResponseFormatter.getStatusDescription(status)}`);
          }
        });
        client.on('associationRejected', (result: TAssociationRejectResult) => {
          // need only REJECT_REASON_MAP status without result, source
          reject(`Association Rejected: ${this.dcmJsResponseFormatter.getRejectReason(result.reason)}`);
        });
        client.on('networkError', (e: Error) => {
          // without stack ?
          reject(`Network error: ${e.message || 'Unknown error'}`);
        });
        client.on('error', (e: Error) => {
          // without stack ?
          reject(`Error: ${e.message || 'Unknown error'}`);
        });
        client.on('closed', () => {
          reject('Connection closed');
        });

        const options = this.configService.getStorescuOptions();

        client.send(pacsServer.host, pacsServer.port, pacsServer.sourceAet ?? DEFAULT_SOURCE_AET, pacsServer.destinationAet, options);
      });

      pingResponse.type = 'success';
      pingResponse.message = `Connection through agent #${pacsServer.agent?.id} to PACS server `
      + `${pacsServer.destinationAet}@${pacsServer.host}:${pacsServer.port} with sourceAet: ${pacsServer.sourceAet || ''} was successfully established`;
    } catch (error) {
      pingResponse.type = 'error';
      pingResponse.message = `Connection through agent #${pacsServer.agent?.id} to PACS server `
      + `${pacsServer.destinationAet}@${pacsServer.host}:${pacsServer.port} with sourceAet: ${pacsServer.sourceAet || ''} was failed with error: ${error as string}`;
    }

    return pingResponse;
  }

  private async performCStore(dataset: Dataset, pacs: IPacsServer, dimseOptions = DEFAULT_DIMSE_OPTIONS) {
    const request = new CStoreRequest(dataset);

    return this.performRequest(pacs, request, dimseOptions);
  }

  private async performCEcho(pacs: IPacsServer, dimseOptions = DEFAULT_DIMSE_OPTIONS) {
    const request = new CEchoRequest();

    return this.performRequest(pacs, request, dimseOptions);
  }

  private async performRequest<T extends Request, K extends TResponseType<T>>(pacs: IPacsServer, request: T, dimseOptions = DEFAULT_DIMSE_OPTIONS) {
    return new Promise<void>(async (resolve, reject) => {
      const isTlsAvailable = dimseOptions.checkTls && await this.checkTlsAvailable(pacs.host, pacs.port);
      if (!isTlsAvailable && !dimseOptions.allowInsecure) {
        reject(`TLS is not available for ${pacs.host}:${pacs.port} and insecure connections are not allowed`);

        return;
      }
      const client = (new Client()) as Client & EventEmitter;
      client.addRequest(request);
      request.on('response', (response: K) => {
        const status = response.getStatus();
        if (status === Status.Success) {
          resolve();
        } else {
          reject(`Unsuccessful response status: ${this.dcmJsResponseFormatter.getStatusDescription(status)}`);
        }
      });
      client.on('associationRejected', (result: TAssociationRejectResult) => {
        reject(`Association Rejected: ${this.dcmJsResponseFormatter.formatRejectResult(result)}`);
      });
      client.on('networkError', (e: Error) => {
        reject(`Network error: ${e.stack || e.message}`);
      });
      client.on('error', (e: Error) => {
        reject(`Error: ${e.stack || e.message}`);
      });
      client.on('closed', () => {
        reject('Connection closed');
      });

      const options: TDcmjsScuOptions = ! isTlsAvailable
        ? this.configService.getStorescuOptions()
        : {
            ...this.configService.getStorescuOptions(),
            securityOptions: {
              requestCert: true,
              rejectUnauthorized: dimseOptions.allowInsecure!,
              minVersion: 'TLSv1.3',
              maxVersion: 'TLSv1.3',
            },
          };

      client.send(pacs.host, pacs.port, pacs.sourceAet ?? DEFAULT_SOURCE_AET, pacs.destinationAet, options);
    });
  }

  private async checkTlsAvailable(host: string, port: number) {
    this.logger.debug(`Checking TLS availability for ${host}:${port}...`);

    return new Promise<boolean>((resolve, reject) => {
        const client = tls.connect(
            port,
            host,
            {
              timeout: this.configService.getCheckTlsTimeout(),
              requestCert: true,
              rejectUnauthorized: false,
            },
            () => {
              resolve(true);
              client.end();
            },
        );

        client.on('error', (err) => {
          reject(err);
        });

        client.on('close', (hadError) => {
          if (hadError) {
            resolve(false);
          }
        });
        client.on('timeout', () => {
          resolve(false);
        });
    });
   }
}
