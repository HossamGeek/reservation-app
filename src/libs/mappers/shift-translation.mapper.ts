import { ProviderShiftResponseDto } from 'src/modules/shifts/dto/response/provider-shift-response.dto';
import { ShiftEntity } from 'src/modules/shifts/entities/shift.entity';

export class ShiftTranslationMapper {
  static toResponse(entity: ShiftEntity): ProviderShiftResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      fromHour: entity.fromHour,
      toHour: entity.toHour,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    };
  }

  static toResponses(entities: ShiftEntity[]): ProviderShiftResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }
}
