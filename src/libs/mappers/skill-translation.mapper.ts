import { I18nContext } from 'nestjs-i18n';
import { DEFAULT_LANGUAGE } from '../constants/global-constants';
import { Skill } from 'src/modules/skills/entities/skill.entity';
import { FindOptionsWhere } from 'typeorm';
import { CreateSkillDto } from 'src/modules/skills/dto/request/create-skill.dto';
import { SkillResponseDto } from 'src/modules/skills/dto/response/skill-response.dto';

import { DuplicateFieldMapping } from 'src/libs/base-service/interfaces/duplicate-validation.interface';

export class SkillTranslationMapper {
  static readonly duplicateFieldsMapping: DuplicateFieldMapping<Skill, CreateSkillDto>[] = [
    { entityField: 'nameAr', dtoField: 'name.ar' },
    { entityField: 'nameEn', dtoField: 'name.en' },
  ];
  static toEntity(dto: CreateSkillDto): Partial<Skill> {
    return {
      nameEn: dto.name.en,
      nameAr: dto.name.ar,
    };
  }

  static toResponse(entity: Skill): SkillResponseDto {
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

  static toResponses(entities: Skill[]): SkillResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }

  static toUniqueWhere(dto: CreateSkillDto): FindOptionsWhere<Skill>[] {
    return [{ nameAr: dto.name.ar }, { nameEn: dto.name.en }];
  }
}
