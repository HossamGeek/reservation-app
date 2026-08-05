import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { IsVarchar } from 'src/libs/decorators/is-varchar.decorator';

export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'example@ERP.com',
  })
  email: string;

  @IsNotEmpty()
  @IsVarchar()
  @ApiProperty({
    example: '***********',
  })
  password: string;
}
