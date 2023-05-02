import type { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { ReadStream } from 'fs';
import { lastValueFrom } from 'rxjs';

import type { TApiDescription } from '~common/types';
import type { LogService } from '~core/log';

import type { HttpRetryService } from './http-retry-service';
import type { HttpService } from './http-service';

interface IRequestOptions {
  config?: AxiosRequestConfig;
  useRetry?: boolean;
}

export abstract class ApiClientService<T extends TApiDescription<any, any, any>> {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: LogService,
    protected readonly httpRetryService?: HttpRetryService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  protected async post<TUrl extends T['url']>(url: TUrl, params?: Extract<T, { url: TUrl }>['payload'], options: IRequestOptions = { config: {}, useRetry: false }) {
    return this.runRequest('post', url, params, options);
  }

  protected async put<TUrl extends T['url']>(url: TUrl, params?: Extract<T, { url: TUrl }>['payload'], options: IRequestOptions = { config: {}, useRetry: false }) {
    return this.runRequest('put', url, params, options);
  }

  protected async getStream<TUrl extends T['url']>(url: TUrl, params: Extract<T, { url: TUrl }>['payload'], type: 'post' | 'put' = 'post') {
    switch (type) {
      case 'post':
        return lastValueFrom(this.httpService.post<Extract<T, { url: TUrl }>['result']>(`${url}`, params, { responseType: 'stream' }));
      case 'put':
        return lastValueFrom(this.httpService.put<Extract<T, { url: TUrl }>['result']>(`${url}`, params, { responseType: 'stream' }));
      default:
        throw new Error(`Unknown HTTP type: ${type}`);
    }
  }

  protected async runRequest<TUrl extends T['url']>(type: 'post' | 'get' | 'put', url: TUrl, params?: Extract<T, { url: TUrl }>['payload'], options?: IRequestOptions) {
    const requestService = options?.useRetry && this.httpRetryService ? this.httpRetryService : this.httpService;
    switch (type) {
      case 'post':
        return lastValueFrom(requestService.post<Extract<T, { url: TUrl }>['result']>(`${url}`, params, options?.config));
      case 'get':
        return lastValueFrom(requestService.get<Extract<T, { url: TUrl }>['result']>(`${url}`, { params }));
      case 'put':
        return lastValueFrom(requestService.put<Extract<T, { url: TUrl }>['result']>(`${url}`, params, options?.config));
      default:
        throw new Error(`Unknown HTTP type: ${type}`);
    }
  }

  protected prepareFormData<T extends Object>(data: T) {
    const formData = new FormData();
    const files: Record<string, ReadStream> = {};

    this.processFormData(data, formData, files);

    for (const key in data) {
      const value = data[key as keyof Object];
      if (typeof value === 'string') {
        formData.append(key, value);
      } else if (typeof value === 'object' && !!value) {
        formData.append(key, JSON.stringify(value), { contentType: 'application/json' });
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

  protected processFormData<T extends Object>(data: T, formData: FormData, files: Record<string, ReadStream>, parentKey?: string | undefined) {
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
