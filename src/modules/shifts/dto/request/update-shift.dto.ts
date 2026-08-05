import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateShiftDto } from './create-shift.dto';

export class UpdateShiftDto extends PartialType(
  OmitType(CreateShiftDto, ['providerId']),
) { }
