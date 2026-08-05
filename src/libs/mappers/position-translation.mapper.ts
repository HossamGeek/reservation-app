import { PositionEntity } from '../../modules/position/entities/position.entity';
import { PositionResponseDto } from '../../modules/position/dto/response/position-response.dto';
import { CreatePositionDto } from '../../modules/position/dto/request/create-position.dto';
import { I18nContext } from 'nestjs-i18n';
import { DEFAULT_LANGUAGE } from '../constants/global-constants';
import { FindOptionsWhere } from 'typeorm';

import { DuplicateFieldMapping } from 'src/libs/base-service/interfaces/duplicate-validation.interface';

export class PositionTranslationMapper {
  static readonly duplicateFieldsMapping: DuplicateFieldMapping<PositionEntity, CreatePositionDto>[] = [
    { entityField: 'nameAr', dtoField: 'name.ar' },
    { entityField: 'nameEn', dtoField: 'name.en' },
  ];
  static toEntity(dto: CreatePositionDto): Partial<PositionEntity> {
    return {
      nameEn: dto.name.en,
      nameAr: dto.name.ar,
    };
  }

  static toResponse(entity: PositionEntity): PositionResponseDto {
    const i18n = I18nContext.current();
    const lang = i18n?.lang ?? DEFAULT_LANGUAGE;
    return {
      id: entity.id,
      name: lang === 'en' ? entity.nameEn : entity.nameAr,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponses(entities: PositionEntity[]): PositionResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }

  static toUniqueWhere(
    dto: CreatePositionDto,
  ): FindOptionsWhere<PositionEntity>[] {
    return [{ nameAr: dto.name.ar }, { nameEn: dto.name.en }];
  }
}
