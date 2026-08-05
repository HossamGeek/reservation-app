import { ReligionEntity } from '../../modules/religion/entities/religion.entity';
import { ReligionResponseDto } from '../../modules/religion/dto/respose/religion-response.dto';
import { CreateReligionDto } from '../../modules/religion/dto/request/create-religion.dto';
import { I18nContext } from 'nestjs-i18n';
import { DEFAULT_LANGUAGE } from '../constants/global-constants';
import { FindOptionsWhere } from 'typeorm';

import { DuplicateFieldMapping } from 'src/libs/base-service/interfaces/duplicate-validation.interface';

export class ReligionMapper {
  static readonly duplicateFieldsMapping: DuplicateFieldMapping<ReligionEntity, CreateReligionDto>[] = [
    { entityField: 'nameAr', dtoField: 'name.ar' },
    { entityField: 'nameEn', dtoField: 'name.en' },
  ];
  static toEntity(dto: CreateReligionDto): Partial<ReligionEntity> {
    return {
      nameEn: dto.name.en,
      nameAr: dto.name.ar,
      isActive: false,
    };
  }

  static toResponse(entity: ReligionEntity): ReligionResponseDto {
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

  static toResponses(entities: ReligionEntity[]): ReligionResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }

  static toUniqueWhere(
    dto: CreateReligionDto,
  ): FindOptionsWhere<ReligionEntity>[] {
    return [{ nameAr: dto.name.ar }, { nameEn: dto.name.en }];
  }
}
