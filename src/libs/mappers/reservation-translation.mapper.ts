import { ReservationResponseDto } from 'src/modules/reservations/dto/response/reservation-response.dto';
import { ReservationEntity } from 'src/modules/reservations/entities/reservation.entity';
import { ClientTranslationMapper } from './client-translation.mapper';
import { ServiceTranslationMapper } from './service-translation.mapper';
import { ShiftTranslationMapper } from './shift-translation.mapper';

export class ReservationTranslationMapper {
  static toResponse(entity: ReservationEntity): ReservationResponseDto {
    return {
      id: entity.id,
      client: entity.client
        ? ClientTranslationMapper.toResponse(entity.client)
        : null,
      service: entity.service
        ? ServiceTranslationMapper.toResponse(entity.service)
        : null,
      date: entity.date,
      shift: entity.shift
        ? ShiftTranslationMapper.toResponse(entity.shift)
        : null,
      status: entity.status,
    };
  }

  static toResponses(entities: ReservationEntity[]): ReservationResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }
}