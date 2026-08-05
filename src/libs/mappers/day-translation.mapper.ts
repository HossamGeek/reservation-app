import { DayEntity } from '../../modules/day/entities/day.entity';
import { DayResponseDto } from '../../modules/day/dto/response/day-response.dto';
import { I18nContext } from 'nestjs-i18n';
import { DEFAULT_LANGUAGE } from '../constants/global-constants';

export class DayTranslationMapper {
  static toResponse(entity: DayEntity): DayResponseDto {
    const i18n = I18nContext.current();
    const lang = i18n?.lang ?? DEFAULT_LANGUAGE;

    return {
      id: entity.id,
      name: lang === 'en' ? entity.nameEn : entity.nameAr,
      sortOrder: entity.sortOrder,
    };
  }

  static toResponses(entities: DayEntity[]): DayResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }
}
