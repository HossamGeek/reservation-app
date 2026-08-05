import { I18nContext } from 'nestjs-i18n';
import { DEFAULT_LANGUAGE } from '../constants/global-constants';
import { CategoryEntity } from 'src/modules/category/entities/category.entity';
import { CategoryResponseDto } from 'src/modules/category/dto/response/category.response.dto';
import { CreateCategoryDto } from 'src/modules/category/dto/request/create-category.dto';
import { UpdateCategoryDto } from 'src/modules/category/dto/request/update-category.dto';
import { FindOptionsWhere } from 'typeorm';

import { DuplicateFieldMapping } from 'src/libs/base-service/interfaces/duplicate-validation.interface';

export class CategoryTranslationMapper {
  static readonly duplicateFieldsMapping: DuplicateFieldMapping<
    CategoryEntity,
    CreateCategoryDto
  >[] = [
    { entityField: 'nameAr', dtoField: 'name.ar' },
    { entityField: 'nameEn', dtoField: 'name.en' },
  ];
  static toEntity(dto: CreateCategoryDto): Partial<CategoryEntity> {
    return {
      nameEn: dto.name.en,
      nameAr: dto.name.ar,
      descriptionEn: dto.description.en,
      descriptionAr: dto.description.ar,
      logoId: dto.logoId ? dto.logoId : undefined,
    };
  }

  static toUpdateEntity(
    entity: CategoryEntity,
    dto: UpdateCategoryDto,
  ): CategoryEntity {
    if (dto.name) {
      entity.nameAr = dto.name.ar;
      entity.nameEn = dto.name.en;
    }
    if (dto.description) {
      entity.descriptionAr = dto.description.ar;
      entity.descriptionEn = dto.description.en;
    }
    if (dto.logoId !== undefined) {
      entity.logoId = dto.logoId;
    }
    return entity;
  }

  static toResponse(entity: CategoryEntity): CategoryResponseDto {
    const i18n = I18nContext.current();
    const lang = i18n?.lang ?? DEFAULT_LANGUAGE;
    return {
      id: entity.id,
      name: lang === 'en' ? entity.nameEn : entity.nameAr,
      description: lang === 'en' ? entity.descriptionEn : entity.descriptionAr,
      logo: entity.logo ? entity.logo.fullUrl() : null,
      isActive: entity.isActive,
    };
  }

  static toResponses(entities: CategoryEntity[]): CategoryResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }

  static toUniqueWhere(
    dto: CreateCategoryDto,
  ): FindOptionsWhere<CategoryEntity>[] {
    return [{ nameAr: dto.name.ar }, { nameEn: dto.name.en }];
  }
}
