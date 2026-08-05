import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TranslationDto } from 'src/libs/dto/translation.dto';
import { CityResponseDto } from 'src/modules/city/dto/response/city-response.dto';
import { DocumentResponseDto } from 'src/modules/document/dto/response/document-response.dto';

export class PendingRequestDocumentsDto {
  @ApiProperty({ type: DocumentResponseDto })
  logo: DocumentResponseDto;

  @ApiProperty({ type: DocumentResponseDto })
  commercialRegistrationDocument: DocumentResponseDto;

  @ApiProperty({ type: DocumentResponseDto })
  recruitmentLicenseDocument: DocumentResponseDto;

  @ApiProperty({ type: DocumentResponseDto })
  nationalAddressProofDocument: DocumentResponseDto;

  @ApiProperty({ type: DocumentResponseDto })
  ibanCertificateDocument: DocumentResponseDto;

  @ApiPropertyOptional({ type: DocumentResponseDto, nullable: true })
  vatCertificateDocument?: DocumentResponseDto | null;
}

export class PendingRequestOwnerDto {
  @ApiProperty({ example: 'Hossam' })
  firstName: string;

  @ApiProperty({ example: 'Hossam' })
  lastName: string;

  @ApiProperty({ example: 'owner@ERP.com' })
  email: string;

  @ApiProperty({ example: '+96659456126' })
  phoneNumber: string;
}

export class ProviderPendingRequestDetailsResponseDto {
  id: string;

  name: TranslationDto;

  address: TranslationDto;

  commercialRegistrationNumber: string;

  recruitmentLicenseNumber: string;

  documents: PendingRequestDocumentsDto;

  owner: PendingRequestOwnerDto;

  rejectionReason?: string | null;

  status: string;

  whiteLabelUrl?: string;

  city: CityResponseDto;
}
