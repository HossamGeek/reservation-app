import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { IsSaudiPhoneNumber } from 'src/libs/decorators/is-saudi-phone-number.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class ClientSignUpDto {
  @ApiProperty({
    description: 'First name of the client',
    example: 'Ahmed',
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  firstName: string;

  @ApiProperty({
    description: 'Last name of the client',
    example: 'Hassan',
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  lastName: string;

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
