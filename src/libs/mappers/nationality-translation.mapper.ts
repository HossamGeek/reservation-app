import { NationalityEntity } from '../../modules/nationality/entities/nationality.entity';
import { NationalityResponseDto } from '../../modules/nationality/dto/respose/nationality-response.dto';
import { I18nContext } from 'nestjs-i18n';
import { DEFAULT_LANGUAGE } from '../constants/global-constants';
import { CreateNationalityDto } from '../../modules/nationality/dto/request/create-nationality.dto';

export class NationalityTranslationMapper {
  static toEntity(dto: CreateNationalityDto): Partial<NationalityEntity> {
    return {
      nameEn: dto.name.en,
      nameAr: dto.name.ar,
      isActive: dto.isActive ?? false,
    };
  }
  static toResponse(entity: NationalityEntity): NationalityResponseDto {
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

  static toResponses(entities: NationalityEntity[]): NationalityResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }

  static toUniqueWhere(
    dto: CreateNationalityDto,
  ): import('typeorm').FindOptionsWhere<NationalityEntity>[] {
    return [
      { nameAr: dto.name.ar },
      { nameEn: dto.name.en },
    ];
  }
}
