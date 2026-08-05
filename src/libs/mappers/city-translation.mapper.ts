import { CityEntity } from '../../modules/city/entities/city.entity';
import { CityResponseDto } from '../../modules/city/dto/response/city-response.dto';
import { CountryTranslationMapper } from './country-translation.mapper';
import { I18nContext } from 'nestjs-i18n';
import { DEFAULT_LANGUAGE } from '../constants/global-constants';
import { CreateCityDto } from 'src/modules/city/dto/request/create-city.dto';
import { FindOptionsWhere } from 'typeorm';

import { DuplicateFieldMapping } from 'src/libs/base-service/interfaces/duplicate-validation.interface';

export class CityTranslationMapper {
  static readonly duplicateFieldsMapping: DuplicateFieldMapping<CityEntity, CreateCityDto>[] = [
    { entityField: 'nameAr', dtoField: 'name.ar' },
    { entityField: 'nameEn', dtoField: 'name.en' },
  ];
  static toEntity(dto: CreateCityDto): Partial<CityEntity> {
    return {
      nameAr: dto.name.ar,
      nameEn: dto.name.en,
      countryId: dto.countryId,
    };
  }

  static toResponse(entity: CityEntity): CityResponseDto {
    const i18n = I18nContext.current();
    const lang = i18n?.lang ?? DEFAULT_LANGUAGE;

    const response: CityResponseDto = {
      id: entity.id,
      name: lang === 'en' ? entity.nameEn : entity.nameAr,
      isActive: entity.isActive,
    };

    if (entity.country) {
      response.country = CountryTranslationMapper.toResponse(entity.country);
    }

    return response;
  }

  static toResponses(entities: CityEntity[]): CityResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }

  static toUniqueWhere(dto: CreateCityDto): FindOptionsWhere<CityEntity>[] {
    return [{ nameAr: dto.name.ar }, { nameEn: dto.name.en }];
  }

}
