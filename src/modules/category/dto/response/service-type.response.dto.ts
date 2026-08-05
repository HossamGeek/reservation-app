import { ServiceTypeOptionResponseDto } from './service-type-option.response.dto';

export class ServiceTypeResponseDto {
  id: string;
  name: string;
  isActive: boolean;
  type: string;
  supportsOptions: boolean;
  options: ServiceTypeOptionResponseDto[];
}
