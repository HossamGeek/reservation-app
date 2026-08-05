import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsSaudiPhoneNumber } from 'src/libs/decorators/is-saudi-phone-number.decorator';

export class CreateClientAddressDto {
  @ApiProperty({ example: 24.7135517 })
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 46.6752957 })
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    example: 'King Fahd Road, Riyadh',
    minLength: 2,
    maxLength: 250,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(250)
  fullAddress: string;

  @ApiProperty({ example: 'Riyadh' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  cityName: string;

  @ApiProperty({ example: 'Home', minLength: 2, maxLength: 250 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(250)
  title: string;

  @ApiProperty({ example: '12B', minLength: 2, maxLength: 250 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(250)
  buildingNumber: string;

  @ApiProperty({ example: '24', minLength: 2, maxLength: 250 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(250)
  homeNumber: string;

  @ApiProperty({
    description: 'Saudi Arabian mobile phone number (spaces are not allowed)',
    example: '+966504545432',
  })
  @IsNotEmpty()
  @IsString()
  @IsSaudiPhoneNumber()
  @Matches(/^[^\s]+$/, {
    message: 'spaces are not allowed in the phone number',
  })
  phoneNumber: string;

  @ApiProperty({ example: true })
  @IsDefined()
  @IsBoolean()
  isDefault: boolean;
}
