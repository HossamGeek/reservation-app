import { UserEntity } from 'src/modules/user/entities/user.entity';

export interface ISignIn {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
}
