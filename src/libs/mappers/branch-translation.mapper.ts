import { I18nContext } from 'nestjs-i18n';
import { CreateBranchDto } from 'src/modules/branch/dto/request/create-branch.dto';
import { UpdateBranchDto } from 'src/modules/branch/dto/request/update-branch.dto';
import { BranchResponseDto } from 'src/modules/branch/dto/response/branch-response.dto';
import { DetailedBranchResponseDto } from 'src/modules/branch/dto/response/detailed-branch-response.dto';
import { BranchEntity } from 'src/modules/branch/entities/branch.entity';
import { FindOptionsWhere } from 'typeorm';
import { DEFAULT_LANGUAGE } from '../constants/global-constants';
import { DuplicateFieldMapping } from '../base-service/interfaces/duplicate-validation.interface';
import { CityTranslationMapper } from './city-translation.mapper';

export class BranchTranslationMapper {
  static readonly duplicateFieldsMapping: DuplicateFieldMapping<
    BranchEntity,
    CreateBranchDto
  >[] = [
    { entityField: 'nameAr', dtoField: 'name.ar' },
    { entityField: 'nameEn', dtoField: 'name.en' },
  ];

  static toEntity(dto: CreateBranchDto): Partial<BranchEntity> {
    return {
      nameAr: dto.name.ar,
      nameEn: dto.name.en,
      addressAr: dto.address.ar,
      addressEn: dto.address.en,
      cityId: dto.cityId,
      logoId: dto.logoId,
    };
  }

  static toResponse(entity: BranchEntity): BranchResponseDto {
    const i18n = I18nContext.current();
    const lang = i18n?.lang ?? DEFAULT_LANGUAGE;
    const city = CityTranslationMapper.toResponse(entity.city);
    return {
      id: entity.id,
      name: lang === 'en' ? entity.nameEn : entity.nameAr,
      address: lang === 'en' ? entity.addressEn : entity.addressAr,
      providerId: entity.providerId,
      city: {
        id: city.id,
        name: city.name,
      },
      logo: entity.logo?.fullUrl() ?? null,
      status: entity.status,
      isMainBranch: entity.isMainBranch,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      workersCount: 20, // TODO: Replace with actual workers count when available
      requestsCount: 20, // TODO: Replace with actual requests count when available
    };
  }
  static toDetailedResponse(entity: BranchEntity): DetailedBranchResponseDto {
    return {
      ...this.toResponse(entity),
      name: {
        ar: entity.nameAr,
        en: entity.nameEn,
      },
      address: {
        ar: entity.addressAr,
        en: entity.addressEn,
      },
    };
  }

  static toResponses(entities: BranchEntity[]): BranchResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }

  static toUpdateEntity(
    entity: BranchEntity,
    dto: UpdateBranchDto,
  ): BranchEntity {
    if (dto.name) {
      entity.nameAr = dto.name.ar;
      entity.nameEn = dto.name.en;
    }

    if (dto.address) {
      entity.addressAr = dto.address.ar;
      entity.addressEn = dto.address.en;
    }

    if (dto.cityId) {
      entity.cityId = dto.cityId;
    }

    return entity;
  }

  static toUniqueWhere(dto: CreateBranchDto): FindOptionsWhere<BranchEntity>[] {
    return [{ nameAr: dto.name.ar }, { nameEn: dto.name.en }];
  }
}
