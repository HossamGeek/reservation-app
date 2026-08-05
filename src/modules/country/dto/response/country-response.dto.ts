import { CityResponseDto } from 'src/modules/city/dto/response/city-response.dto';

export class CountryResponseDto {
  id: string;

  name: string;

  logo: string | null;

  isActive: boolean;

  cities?: CityResponseDto[];

  createdAt: Date;

  updatedAt: Date;
}
