import { Injectable } from '@nestjs/common';

import type { IApiOptions } from './api.interfaces';

@Injectable()
export class ApiRegistry {
  private readonly apis = new Map<string, IApiOptions>();

  public setApiOptions(url: string, options: IApiOptions) {
    if (this.hasApiOptions(url)) {
      throw new Error(`API url "${url}" is already set`);
    }

    this.apis.set(url, options);
  }

  public hasApiOptions(url: string) {
    return this.apis.has(url);
  }

  public getApiOptions(url: string) {
    if (!this.hasApiOptions(url)) {
      throw new Error(`API url "${url}" is not in registry`);
    }

    return this.apis.get(url);
  }

  public getApisOptions() {
    return this.apis;
  }
}
