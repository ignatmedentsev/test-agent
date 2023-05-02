import { Injectable } from '@nestjs/common';
import type FormData from 'form-data';

import { EPlatformApiUrl } from '~common/enums';
import type { ETaskStatus, ETaskType } from '~common/enums';
import type { IPacsFileInfo } from '~common/interfaces';
import type { TApiDescription, TPlatformApiResponse, TPlatformRequestApiPayload, TTaskStatusResponsePayload } from '~common/types';
import { LogService } from '~core/log';

import { ApiClientService } from './api-client.service';
import { PlatformHttpRetryService } from './platform-http-retry-service';
import { PlatformHttpService } from './platform-http-service';

const MAX_CONTENT_LENGTH = 1 * 1024 * 1024 * 1024; // 1 Gb in Bytes

type TPlatformApiClienteDescriptionMap = {
  [TUrl in EPlatformApiUrl]: TApiDescription<TUrl, TPlatformRequestApiPayload[TUrl], TPlatformApiResponse[TUrl]>
};

type TPlatformApiClienteDescription<T extends EPlatformApiUrl> = T extends keyof TPlatformApiClienteDescriptionMap
  ? TPlatformApiClienteDescriptionMap[T]
  : never;

@Injectable()
export class PlatformApiClientService extends ApiClientService<TPlatformApiClienteDescription<EPlatformApiUrl>
> {
  constructor(
    httpService: PlatformHttpService,
    httpRetryService: PlatformHttpRetryService,
    logger: LogService,
  ) {
    super(httpService, logger, httpRetryService);
    this.logger.setContext(this.constructor.name);
  }

  public async getOrganizationInfo() {
    const res = await this.post(EPlatformApiUrl.GET_ORGANIZATION_INFO);

    return res.data;
  }

  public async agentAuth(agentKey: string, agentUUID: string, version: string, os: string, mode: string) {
    const res = await this.post(EPlatformApiUrl.AGENT_AUTH, { agentKey, agentUUID, version, os, mode });

    return res.data;
  }

  public async getAgentFileStream(taskId: string) {
    const res = await this.getStream(EPlatformApiUrl.AGENT_TASK_GET_FILE, { taskId });

    return res.data;
  }

  public async updateTaskStatus<T extends ETaskStatus, T1 extends ETaskType>(
    taskId: string,
    status: T,
    type: T1,
    payload?: TTaskStatusResponsePayload<T, T1>,
  ) {
    const res = await this.post(
      EPlatformApiUrl.AGENT_TASK_UPDATE_STATUS,
      this.prepareFormData({ taskId, status, type, payload }),
      { config: { maxContentLength: MAX_CONTENT_LENGTH }, useRetry: true },
    );

    return res.data;
  }

  public async newPacsFileProcess(formData: FormData) {
    const res = await this.post(EPlatformApiUrl.PACS_FILE_AGENT_PROCESS, formData, { config: { maxContentLength: MAX_CONTENT_LENGTH } });

    return res.data;
  }

  public async newPacsFileSave(pacsFileInfo: IPacsFileInfo) {
    const res = await this.post(EPlatformApiUrl.PACS_FILE_AGENT_SAVE, pacsFileInfo);

    return res.data;
  }
}
