import { CityResponseDto } from 'src/modules/city/dto/response/city-response.dto';
export class RequestOwnerDto {
  firstName: string;

  lastName: string;

  email: string;

  phoneNumber: string;
}

export class ProviderDetailsResponseDto {
  id: string;

  name: string;

  address: string;

  commercialRegistrationNumber: string;

  recruitmentLicenseNumber: string;

  owner: RequestOwnerDto;

  status: string;

  whiteLabelUrl?: string;

  city: CityResponseDto;

  createdAt: Date;

  updatedAt: Date;
}
