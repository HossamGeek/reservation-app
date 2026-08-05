import { UserStatusEnum } from 'src/libs/enums/user-status.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { RoleEntity } from 'src/modules/role/entities/role.entity';

export class SignInResponseDto {
  user:
    | ClientSignInResponseDto
    | ProviderSignInResponseDto
    | AdminSignInResponseDto
    | WorkerSignInResponseDto;
  accessToken: string;
  refreshToken: string;
}

export class BaseSignInResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  type: UserTypeEnum;
  status: UserStatusEnum;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: Date;
}
export class ClientSignInResponseDto extends BaseSignInResponseDto {
  address: string | null;
}

export class ProviderSignInResponseDto extends BaseSignInResponseDto {
  image: string;
  providerId: string;
  role: RoleEntity | null;
}
export class AdminSignInResponseDto extends BaseSignInResponseDto {
  image: string;
  role: RoleEntity | null;
}

export class WorkerSignInResponseDto extends BaseSignInResponseDto {}
