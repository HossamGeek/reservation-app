import { IsEmail, IsEnum, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { IsVarchar } from 'src/libs/decorators/is-varchar.decorator';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { IsRequiredForUserTypes } from 'src/libs/decorators/is-required-for-user-types.decorator';
import { IsBigIntId } from 'src/libs/decorators/is-bigint-id.decorator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsRequiredForUserTypes([UserTypeEnum.CLIENT])
  @IsVarchar()
  @IsStrongPassword(
    {},
    {
      message:
        'password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
    },
  )
  password: string;

  @IsNotEmpty()
  @IsEnum(UserTypeEnum)
  type: UserTypeEnum;

  @IsRequiredForUserTypes([UserTypeEnum.ADMIN, UserTypeEnum.PROVIDER])
  @IsBigIntId()
  roleId?: string;
}
