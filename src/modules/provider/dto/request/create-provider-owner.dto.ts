import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import { IsSaudiPhoneNumber } from 'src/libs/decorators/is-saudi-phone-number.decorator';

export class CreateProviderOwnerDto {
  @ApiProperty({
    description: 'Owner first name',
    example: 'Mohamed',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    description: 'Owner last name',
    example: 'Mohamed',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    description: 'Owner email address',
    example: 'owner@ERP.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Owner phone number',
    example: '+966594561261',
  })
  @IsNotEmpty()
  @IsSaudiPhoneNumber()
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'Owner password',
    example: 'Password123!',
  })
  @IsStrongPassword()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  password?: string;
}
