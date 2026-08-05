import { CityResponseDto } from "src/modules/city/dto/response/city-response.dto";

export class ProviderResponseDto {
  id: string;

  name: string;

  status: string;

  createdAt: Date;

  updatedAt: Date;

  city?: CityResponseDto;

  logo?: string | null;

  totalOrders?: number;

  balance?: string;
}
