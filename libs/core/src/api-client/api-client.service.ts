import { Injectable } from '@nestjs/common';
import type { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { ReadStream } from 'fs';
import { lastValueFrom } from 'rxjs';

import type { SubmitExamDto } from '~common/dto';
import type { ETaskStatus, ETaskType } from '~common/enums';
import { EPlatformApiUrl } from '~common/enums';
import type { IPacsFileInfo } from '~common/interfaces';
import type { TPlatformRequestApiPayload, TPlatformApiResponse, TTaskStatusResponsePayload } from '~common/types';
import { LogService } from '~core/log';

import { HttpApiService } from './http-api-service';
import { HttpRetryService } from './http-retry-service';

interface IRequestOptions {
  config?: AxiosRequestConfig;
  useRetry?: boolean;
}

const MAX_CONTENT_LENGTH = 1 * 1024 * 1024 * 1024; // 1 Gb in Bytes

@Injectable()
export class ApiClientService {
  constructor(
    private readonly httpService: HttpApiService,
    private readonly httpRetryService: HttpRetryService,
    private readonly logger: LogService,
  ) {
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

  public async submitExamWithoutFormThroughAgent(exam: SubmitExamDto) {
    const res = await this.post(EPlatformApiUrl.EXAM_SUBMIT_WITHOUT_FORM_THROUGH_AGENT, exam);

    return res.data;
  }

  private async post<
    TUrl extends EPlatformApiUrl,
    P extends TPlatformRequestApiPayload<TUrl>,
  >(url: TUrl, params?: P, options: IRequestOptions = { config: {}, useRetry: false }) {
    return this.runRequest('post', url, params, options);
  }

  private async getStream<TUrl extends EPlatformApiUrl, P extends TPlatformRequestApiPayload<TUrl>>(url: TUrl, params: P) {
    return lastValueFrom(this.httpService.post(`${url}`, params, { responseType: 'stream' }));
  }

  private async runRequest<
    Url extends EPlatformApiUrl,
    Payload extends TPlatformRequestApiPayload<Url>,
    Result extends TPlatformApiResponse<Url>,
  >(type: 'post' | 'get', url: Url, params?: Payload, options?: IRequestOptions) {
    const requestService = options?.useRetry ? this.httpRetryService : this.httpService;
    switch (type) {
      case 'post':
        return lastValueFrom(requestService.post<Result>(`${url}`, params, options?.config));
      case 'get':
        return lastValueFrom(requestService.get<Result>(`${url}`, { params }));
      default:
        throw new Error(`Unknown HTTP type: ${type}`);
    }
  }

  private prepareFormData<T extends Object>(data: T) {
    const formData = new FormData();
    const files: Record<string, ReadStream> = {};

    this.processFormData(data, formData, files);

    for (const key in data) {
      const value = data[key as keyof Object];
      if (typeof value === 'string') {
        formData.append(key, value);
      } else if (typeof value === 'object' && !!value) {
        formData.append(key, JSON.stringify(value));
      } else {
        if (!!value) {
          formData.append(key, `${value}`);
        }
      }
    }

    for (const [key, value] of Object.entries(files)) {
      formData.append(key, value);
    }

    return formData;
  }

  private processFormData<T extends Object>(data: T, formData: FormData, files: Record<string, ReadStream>, parentKey?: string | undefined) {
    for (const key in data) {
      if (!data.hasOwnProperty(key)) {
        continue;
      }

      const formKey = parentKey
        ? `${parentKey}[${key}]`
        : key;
      const value = data[key as keyof Object];
      if (value instanceof ReadStream) {
        files[formKey] = value;
        delete data[key as keyof T];
      } else if (typeof value === 'object' && !!value) {
        this.processFormData(value, formData, files, formKey);
      }
    }
  }
}
