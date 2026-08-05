import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ProviderStatusEnum } from 'src/libs/enums/provider-status.enum';

export class UpdateProviderApplicationStatusDto {
  @ApiProperty({
    enum: [ProviderStatusEnum.Approved, ProviderStatusEnum.Rejected],
    description: 'Status to update the application to (Approved or Rejected)',
    example: 'Approved',
  })
  @IsNotEmpty()
  @IsIn([ProviderStatusEnum.Approved, ProviderStatusEnum.Rejected], {
    message: `status must be one of: ${ProviderStatusEnum.Approved}, ${ProviderStatusEnum.Rejected}`,
  })
  status: ProviderStatusEnum;

  @ApiPropertyOptional({
    description: 'Reason for rejecting the provider application',
    example: 'Required documents do not meet the verification requirements.',
    maxLength: 500,
  })
  @ValidateIf((o) => o.status === ProviderStatusEnum.Rejected)
  @IsNotEmpty({
    message: 'rejectionReason is required when status is Rejected.',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  rejectionReason: string | null;
}
