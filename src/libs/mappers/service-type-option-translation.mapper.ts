import { I18nContext } from 'nestjs-i18n';
import { DEFAULT_LANGUAGE } from '../constants/global-constants';
import { ServiceTypeOptionResponseDto } from 'src/modules/category/dto/response/service-type-option.response.dto';
import { ServiceTypeOptionEntity } from 'src/modules/category/entities/service-type-option.entity';
import { CreateServiceTypeOptionDto } from 'src/modules/category/dto/request/create-service-type-option.dto';
import { FindOptionsWhere } from 'typeorm';
import { DuplicateFieldMapping } from 'src/libs/base-service/interfaces/duplicate-validation.interface';

export class ServiceTypeOptionTranslationMapper {
  static readonly duplicateFieldsMapping: DuplicateFieldMapping<
    ServiceTypeOptionEntity,
    CreateServiceTypeOptionDto
  >[] = [
    {
      entityField: 'nameAr',
      dtoField: 'name.ar',
      customErrorMessageKey: 'service-type-options.errors.duplicateNameAr',
    },
    {
      entityField: 'nameEn',
      dtoField: 'name.en',
      customErrorMessageKey: 'service-type-options.errors.duplicateNameEn',
    },
  ];
  static toEntity(
    dto: CreateServiceTypeOptionDto,
  ): Partial<ServiceTypeOptionEntity> {
    return {
      nameEn: dto.name.en,
      nameAr: dto.name.ar,
      descriptionEn: dto.description.en,
      descriptionAr: dto.description.ar,
      logoId: dto.logoId,
      serviceTypeId: dto.serviceTypeId,
    };
  }

  static toResponse(
    entity: ServiceTypeOptionEntity,
  ): ServiceTypeOptionResponseDto {
    const i18n = I18nContext.current();
    const lang = i18n?.lang ?? DEFAULT_LANGUAGE;
    return {
      id: entity.id,
      name: lang === 'en' ? entity.nameEn : entity.nameAr,
      isActive: entity.isActive,
      description: lang === 'en' ? entity.descriptionEn : entity.descriptionAr,
      logo: entity.logo ? entity.logo.fullUrl() : null,
      type: entity.type,
    };
  }

  static toResponses(
    entities: ServiceTypeOptionEntity[],
  ): ServiceTypeOptionResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }

  static toUniqueWhere(
    dto: CreateServiceTypeOptionDto,
  ): FindOptionsWhere<ServiceTypeOptionEntity>[] {
    return [{ nameAr: dto.name.ar }, { nameEn: dto.name.en }];
  }
}
