import { RoleEntity } from 'src/modules/role/entities/role.entity';
import { UserTypeEnum } from '../enums/user-type.enum';
import { UserStatusEnum } from '../enums/user-status.enum';
import { SystemAdminEntity } from 'src/modules/user/entities/system-admin.entity';
import { ProviderAdminEntity } from 'src/modules/user/entities/provider-admin.entity';
import { ClientEntity } from 'src/modules/client/entities/client.entity';

export interface ILoginUser {
  id: string;
  email?: string | null;
  phoneNumber: string;

  type: UserTypeEnum;
  status: UserStatusEnum;

  systemAdmin?: SystemAdminEntity | null;
  providerAdmin?: ProviderAdminEntity | null;
  client?: ClientEntity | null;

  role: RoleEntity | null;
  slug?: string;
}
