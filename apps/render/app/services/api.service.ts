import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { EAgentApiUrl, ESystemUrlType } from '~common/enums';
import type { TAgentApiType } from '~common/types';
import { MAIN_HTTP_URL } from '~render/main-url.token';

type THttpMethod = 'GET' | 'POST' | 'DELETE';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    @Inject(MAIN_HTTP_URL) private readonly mainUrl: string,
    private readonly http: HttpClient,
  ) {}

  public getOrganizationInfo() {
    return this.post(EAgentApiUrl.GET_ORGANIZATION_INFO);
  }

  public agentAuth(agentKey: string) {
    return this.post(EAgentApiUrl.AGENT_AUTH, { agentKey });
  }

  public openUrl(url: string) {
    return this.systemRequest(ESystemUrlType.OPEN_URL, { url });
  }

  private post<T extends EAgentApiUrl>(url: T, params: any = {}) {
    return this.runRequest('POST', url, params);
  }

  private runRequest<T extends EAgentApiUrl, K extends Awaited<TAgentApiType<T>>>(type: THttpMethod, url: T, params: any) {
    switch (type) {
      case 'POST':
        return this.http.post<K>(`${this.mainUrl}${url}`, params);
      case 'GET':
        return this.http.get<K>(`${this.mainUrl}${url}`, { params });
      default:
        throw new Error(`Unknown HTTP type: ${type}`);
    }
  }

  private systemRequest(url: ESystemUrlType, params: any = {}) {
    return this.http.post(`${this.mainUrl}${url}`, params);
  }
}
