import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import type { IOrganizationInfo, IUserInfo } from '~common/interfaces';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly organizationInfo = new BehaviorSubject<IOrganizationInfo | undefined>(undefined);
  private readonly userInfo = new BehaviorSubject<IUserInfo | undefined>(undefined);

  public setOrganizationInfo(data: IOrganizationInfo) {
    this.organizationInfo.next(data);
  }

  public setUserInfo(data: IUserInfo) {
    this.userInfo.next(data);
  }

  public getUserInfo() {
    return this.userInfo;
  }

  public getOrganizationInfo() {
    return this.organizationInfo;
  }

  public clearInfo() {
    this.organizationInfo.next(undefined);
    this.userInfo .next(undefined);
  }
}
