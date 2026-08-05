import { I18nContext } from 'nestjs-i18n';
import { ServiceTypeResponseDto } from 'src/modules/category/dto/response/service-type.response.dto';
import { ServiceTypeEntity } from 'src/modules/category/entities/service-type.entity';
import { DEFAULT_LANGUAGE } from '../constants/global-constants';
import { ServiceTypeOptionTranslationMapper } from './service-type-option-translation.mapper';

export class ServiceTypeTranslationMapper {
  static toResponse(entity: ServiceTypeEntity): ServiceTypeResponseDto {
    const i18n = I18nContext.current();
    const lang = i18n?.lang ?? DEFAULT_LANGUAGE;
    return {
      id: entity.id,
      name: lang === 'en' ? entity.nameEn : entity.nameAr,
      isActive: entity.isActive,
      supportsOptions: entity.supportsOptions,
      options:
        entity.options && entity.options.length > 0
          ? ServiceTypeOptionTranslationMapper.toResponses(entity.options)
          : [],
      type: entity.type,
    };
  }

  static toResponses(entities: ServiceTypeEntity[]): ServiceTypeResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }
}
