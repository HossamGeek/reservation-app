import { FindOptionsWhere } from 'typeorm';
import { CreateLanguageDto } from 'src/modules/languages/dto/request/create-language.dto';
import { LanguageEntity } from 'src/modules/languages/entities/language.entity';
import { I18nContext } from 'nestjs-i18n';
import { DEFAULT_LANGUAGE } from '../constants/global-constants';
import { LanguageResponseDto } from 'src/modules/languages/dto/respose/language-response.dto';

import { DuplicateFieldMapping } from 'src/libs/base-service/interfaces/duplicate-validation.interface';

export class LanguageTranslationMapper {
  static readonly duplicateFieldsMapping: DuplicateFieldMapping<LanguageEntity, CreateLanguageDto>[] = [
    { entityField: 'nameAr', dtoField: 'name.ar' },
    { entityField: 'nameEn', dtoField: 'name.en' },
  ];
  static toEntity(dto: CreateLanguageDto): Partial<LanguageEntity> {
    return {
      nameEn: dto.name.en,
      nameAr: dto.name.ar,
    };
  }

  static toResponse(entity: LanguageEntity): LanguageResponseDto {
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

  static toResponses(entities: LanguageEntity[]): LanguageResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }

  static toUniqueWhere(
    dto: CreateLanguageDto,
  ): FindOptionsWhere<LanguageEntity>[] {
    return [{ nameAr: dto.name.ar }, { nameEn: dto.name.en }];
  }
}
