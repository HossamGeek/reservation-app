import { CountryEntity } from '../../modules/country/entities/country.entity';
import { CountryResponseDto } from '../../modules/country/dto/response/country-response.dto';
import { I18nContext } from 'nestjs-i18n';
import { DEFAULT_LANGUAGE } from '../constants/global-constants';
import { CityTranslationMapper } from './city-translation.mapper';

export class CountryTranslationMapper {
  /*We do not have a create endpoint, so we don't need toEntity*/
  // static toEntity(dto: CreateCountryDto): Partial<CountryEntity> {
  //   return {
  //     nameAr: dto.name.ar,
  //     nameEn: dto.name.en,

  //     isActive: dto.isActive,
  //     code: dto.code,
  //   };
  // }

  static toResponse(entity: CountryEntity): CountryResponseDto {
    const i18n = I18nContext.current();
    const lang = i18n?.lang ?? DEFAULT_LANGUAGE;

    const response: CountryResponseDto = {
      id: entity.id,
      name: lang === 'en' ? entity.nameEn : entity.nameAr,
      isActive: entity.isActive,
      logo: entity.code
        ? `https://flagsapi.com/${entity.code}/flat/64.png`
        : null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    if (entity.cities && entity.cities.length > 0) {
      response.cities = CityTranslationMapper.toResponses(entity.cities);
    }

    return response;
  }

  static toResponses(entities: CountryEntity[]): CountryResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }
}
