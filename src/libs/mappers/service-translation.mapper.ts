import { I18nContext } from 'nestjs-i18n';
import { FindOptionsWhere } from 'typeorm';
import { DEFAULT_LANGUAGE } from '../constants/global-constants';
import { CreateServiceDto } from 'src/modules/service/dto/request/create-service.dto';
import { ServiceListResponseDto } from 'src/modules/service/dto/response/service-list-response.dto';
import { ServiceDetailsResponseDto } from 'src/modules/service/dto/response/service-details-response.dto';
import { CategoryTranslationMapper } from './category-translation.mapper';
import { ServiceTypeTranslationMapper } from './service-type-translation.mapper';
import { ServiceEntity } from 'src/modules/service/entities/service.entity';

import { DuplicateFieldMapping } from 'src/libs/base-service/interfaces/duplicate-validation.interface';

export class ServiceTranslationMapper {
  static readonly duplicateFieldsMapping: DuplicateFieldMapping<ServiceEntity, CreateServiceDto>[] = [
    { entityField: 'nameAr', dtoField: 'name.ar' },
    { entityField: 'nameEn', dtoField: 'name.en' },
  ];
  static toEntity(dto: CreateServiceDto): Partial<ServiceEntity> {
    return {
      categoryId: dto.categoryId,
      serviceTypeId: dto.serviceTypeId,
      logoId: dto.logoId ?? null,
      nameAr: dto.name.ar,
      nameEn: dto.name.en,
      descriptionAr: dto.description.ar,
      descriptionEn: dto.description.en,
    };
  }

  static toResponse(entity: ServiceEntity): ServiceDetailsResponseDto {
    const i18n = I18nContext.current();
    const lang = i18n?.lang ?? DEFAULT_LANGUAGE;
    const logoUrl = entity.logo ? entity.logo.fullUrl() : null;

    return {
      id: entity.id,
      name: lang === 'en' ? entity.nameEn : entity.nameAr,
      description: lang === 'en' ? entity.descriptionEn : entity.descriptionAr,
      logoUrl,
      isActive: entity.isActive,
      category: entity.category
        ? CategoryTranslationMapper.toResponse(entity.category)
        : null,
      serviceType: entity.serviceType
        ? ServiceTypeTranslationMapper.toResponse(entity.serviceType)
        : null,
    };
  }

  static toResponses(entities: ServiceEntity[]): ServiceListResponseDto[] {
    const i18n = I18nContext.current();
    const lang = i18n?.lang ?? DEFAULT_LANGUAGE;

    return entities.map((entity) => ({
      id: entity.id,
      name: lang === 'en' ? entity.nameEn : entity.nameAr,
      description: lang === 'en' ? entity.descriptionEn : entity.descriptionAr,
      logo: entity.logo ? entity.logo.fullUrl() : null,
      isActive: entity.isActive,
    }));
  }

  static toUniqueWhere(
    dto: CreateServiceDto,
  ): FindOptionsWhere<ServiceEntity>[] {
    return [{ nameAr: dto.name.ar }, { nameEn: dto.name.en }];
  }
}
