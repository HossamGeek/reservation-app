import { UserTypeEnum } from '../enums/user-type.enum';

export interface IUserTokenPayload {
  id: string;
  type: UserTypeEnum;
  roleId: string | null;
  slug: string;
}
