import { ReservationStatusEnum } from 'src/libs/enums/reservation-status.enum';
import { ClientResponseDto } from 'src/modules/client/dto/response/client-response.dto';
import { ServiceDetailsResponseDto } from 'src/modules/service/dto/response/service-details-response.dto';
import { ProviderShiftResponseDto } from 'src/modules/shifts/dto/response/provider-shift-response.dto';

export class ReservationResponseDto {
  id: string;
  client: ClientResponseDto | null;
  service: ServiceDetailsResponseDto | null;
  date: string;
  shift: ProviderShiftResponseDto | null;
  status: ReservationStatusEnum;
}