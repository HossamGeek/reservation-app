import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { UpdateProviderOwnerDto } from './update-provider-owner.dto';
import { CreateProviderDto, ProviderDocumentsDto } from './create-provider.dto';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';

export class UpdateProviderDto extends PartialType(
  OmitType(CreateProviderDto, ['owner', 'documents'] as const),
) {
  @ApiProperty({
    type: UpdateProviderOwnerDto,
    example: {
      firstName: 'Mohamed',
    },
  })
  @ValidateNested()
  @Type(() => UpdateProviderOwnerDto)
  owner: UpdateProviderOwnerDto;

  @ApiProperty({
    type: ProviderDocumentsDto,
    example: {
      commercialRegistrationDocumentId: '1',
      vatCertificateDocumentId: '5',
    },
    title: 'Only Currently Rejected Provider Documents',
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PartialType(ProviderDocumentsDto))
  documents: Partial<ProviderDocumentsDto>;
}
