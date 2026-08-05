import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IsBigIntId } from 'src/libs/decorators/is-bigint-id.decorator';
import { TranslationDto } from 'src/libs/dto/translation.dto';
import { CreateProviderOwnerDto } from './create-provider-owner.dto';

export class ProviderDocumentsDto {
  @ApiProperty({
    description: 'Logo id',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  @IsBigIntId()
  logoId: string;

  @ApiProperty({
    description: 'Commercial registration document id',
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  @IsBigIntId()
  commercialRegistrationDocumentId: string;

  @ApiProperty({
    description: 'Recruitment license document id',
    example: '124',
  })
  @IsString()
  @IsNotEmpty()
  @IsBigIntId()
  recruitmentLicenseDocumentId: string;

  @ApiProperty({
    description: 'National address proof document id',
    example: '125',
  })
  @IsString()
  @IsNotEmpty()
  @IsBigIntId()
  nationalAddressProofDocumentId: string;

  @ApiProperty({ description: 'IBAN certificate document id', example: '126' })
  @IsString()
  @IsNotEmpty()
  @IsBigIntId()
  ibanCertificateDocumentId: string;

  @ApiPropertyOptional({
    description: 'VAT certificate document id',
    example: '127',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsBigIntId()
  vatCertificateDocumentId?: string;
}
export class CreateProviderDto {
  @ApiProperty({
    type: TranslationDto,
    example: {
      ar: 'مقدم خدمة',
      en: 'Service Provider',
    },
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TranslationDto)
  name: TranslationDto;

  @ApiProperty({
    type: TranslationDto,
    example: {
      ar: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
      en: 'King Fahd Road, Riyadh, Saudi Arabia',
    },
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TranslationDto)
  address: TranslationDto;

  @ApiProperty({
    description: 'Commercial registration number',
    example: 'CR123456',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  commercialRegistrationNumber: string;

  @ApiProperty({
    description: 'Recruitment license number',
    example: 'RL987654',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  recruitmentLicenseNumber: string;

  @ApiProperty({
    description: 'City Id',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  @IsBigIntId()
  cityId: string;

  @ApiProperty({
    type: CreateProviderOwnerDto,
    example: {
      firstName: 'Mohamed',
      lastName: 'Elfate7',
      email: 'owner@ERP.com',
      phoneNumber: '+966594561261',
    },
  })
  @ValidateNested()
  @Type(() => CreateProviderOwnerDto)
  owner: CreateProviderOwnerDto;

  @ApiProperty({
    type: ProviderDocumentsDto,
    example: {
      commercialRegistrationDocumentId: '1',
      recruitmentLicenseDocumentId: '2',
      nationalAddressProofDocumentId: '3',
      ibanCertificateDocumentId: '4',
      vatCertificateDocumentId: '5',
    },
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ProviderDocumentsDto)
  documents: ProviderDocumentsDto;
}
