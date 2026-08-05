import { ApiProperty } from '@nestjs/swagger';
import { ClientLoginDto } from './client-login.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class VerifyOtpDto extends ClientLoginDto {
  @ApiProperty({
    description: "One-time password (OTP) sent to the user's phone number",
    example: '1234',
  })
  @IsNotEmpty()
  @IsInt()
  otp: number;
}
