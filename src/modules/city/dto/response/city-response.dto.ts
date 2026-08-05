import { CountryResponseDto } from 'src/modules/country/dto/response/country-response.dto';

export class CityResponseDto {
  id: string;

  name: string;

  isActive: boolean;

  country?: CountryResponseDto;
}
