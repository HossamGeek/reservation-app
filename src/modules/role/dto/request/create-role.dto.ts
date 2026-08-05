import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import { IsValidPermissions } from 'src/libs/decorators/invalid_entity.decorator';
import { IsName } from 'src/libs/decorators/is-name.decorator';
import { IsVarchar } from 'src/libs/decorators/is-varchar.decorator';
import { ApiProperty } from '@nestjs/swagger';

export type FrontendPermission = {
  [Category in CategoriesEnum]: ActionsEnum[];
};

export class CreateRoleDto {
  @IsNotEmpty()
  @IsVarchar()
  @IsName()
  @ApiProperty({
    description: 'The name of the role',
    example: 'Admin',
    maxLength: 255,
    minLength: 1,
  })
  @MaxLength(255, { message: 'Role name must not exceed 255 characters' })
  @MinLength(1, { message: 'Role name must be at least 1 character long' })
  name: string;

  @IsNotEmpty()
  @IsValidPermissions()
  @ApiProperty({
    description: 'The permissions for the role',
    example: {
      users: ['read', 'write'],
      roles: ['read'],
    },
  })
  permissions: FrontendPermission;
}
