import { PartialType } from '@nestjs/swagger';
import { CreateServiceTypeOptionDto } from './create-service-type-option.dto';

export class UpdateServiceTypeOptionDto extends PartialType(
  CreateServiceTypeOptionDto,
) {}
