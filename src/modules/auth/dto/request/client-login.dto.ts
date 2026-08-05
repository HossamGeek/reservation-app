import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { IsSaudiPhoneNumber } from 'src/libs/decorators/is-saudi-phone-number.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class ClientLoginDto {
  @ApiProperty({
    description: 'Saudi Arabian mobile phone number (spaces are not allowed)',
    example: '+966504545432',
  })
  @IsNotEmpty()
  @IsString()
  @IsSaudiPhoneNumber()
  @Matches(/^[^\s]+$/, { message: 'spaces are not allowed in the phone number' })
  phoneNumber: string;
}
