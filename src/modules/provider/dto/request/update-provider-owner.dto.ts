import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProviderOwnerDto } from './create-provider-owner.dto';

export class UpdateProviderOwnerDto extends PartialType(
  OmitType(CreateProviderOwnerDto, [
    'password',
    'email',
    'phoneNumber',
  ] as const),
) {}
