import { Injectable } from '@angular/core';

import type { IOrganizationInfo, IUserInfo } from '~common/interfaces';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private organizationInfo: IOrganizationInfo | undefined;
  private userInfo: IUserInfo | undefined;

  public setOrganizationInfo(data: IOrganizationInfo) {
    this.organizationInfo = data;

    return this.organizationInfo;
  }

  public setUserInfo(data: IUserInfo) {
    this.userInfo = data;

    return this.userInfo;
  }

  public getUserInfo() {
    return this.userInfo;
  }

  public getOrganizationInfo() {
    return this.organizationInfo;
  }

  public clearInfo() {
    this.organizationInfo = undefined;
    this.userInfo = undefined;
  }
}
