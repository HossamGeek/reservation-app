import { CategoryResponseDto } from '../../../category/dto/response/category.response.dto';
import { ServiceTypeResponseDto } from '../../../category/dto/response/service-type.response.dto';

export class ServiceDetailsResponseDto {
  id: string;

  name: string;

  description: string;

  logoUrl: string | null;

  isActive: boolean;

  category: CategoryResponseDto | null;

  serviceType: ServiceTypeResponseDto | null;
}
