import { ExperienceEntity } from '../../modules/experience/entities/experience.entity';
import { ExperienceResponseDto } from '../../modules/experience/dto/respose/experience-response.dto';
import { CreateExperienceDto } from '../../modules/experience/dto/request/create-experience.dto';

export class ExperienceMapper {
  static toEntity(dto: CreateExperienceDto): Partial<ExperienceEntity> {
    return {
      minYears: dto.minYears,
      maxYears: dto.maxYears ?? null,
      isActive: false,
    };
  }

  static toResponse(entity: ExperienceEntity): ExperienceResponseDto {
    return {
      id: entity.id,
      minYears: entity.minYears,
      maxYears: entity.maxYears,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponses(entities: ExperienceEntity[]): ExperienceResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }
}
