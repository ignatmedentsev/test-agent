export interface IUserInfo {
  id: number;
  firstName: string;
  lastName: string;
  organizations: Array<{ id: number, name: string, shortName: string }>;
}
