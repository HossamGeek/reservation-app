import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsBigIntId } from 'src/libs/decorators/is-bigint-id.decorator';
import { IsSaudiNationalId } from 'src/libs/decorators/is-saudi-national-id.decorator';
import { ClientSignUpDto } from 'src/modules/auth/dto/request/client-sign-up.dto';

export class UpdateClientProfileDto extends PartialType(
  PickType(ClientSignUpDto, ['firstName', 'lastName', 'phoneNumber']),
) {
  @ApiProperty({
    description: 'Client email address',
    example: 'client@ERP.com',
  })
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiProperty({
    description: 'Profile image document id',
    example: '1',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsBigIntId()
  logoId?: string;

  @ApiProperty({
    description: 'Saudi National ID',
    example: '1234567891',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsSaudiNationalId()
  nationalId?: string;
}
