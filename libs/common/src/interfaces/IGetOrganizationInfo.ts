import type { IOrganizationInfo, IUserInfo } from '~common/interfaces';

export interface IGetOrganizationInfo {
  organizationInfo: IOrganizationInfo;
  userInfo: IUserInfo;

  token: string;
}
