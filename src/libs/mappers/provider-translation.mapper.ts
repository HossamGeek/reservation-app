import { I18nContext } from 'nestjs-i18n';
import { DEFAULT_LANGUAGE } from '../constants/global-constants';
import { ProviderEntity } from 'src/modules/provider/entities/provider.entity';
import { ProviderResponseDto } from 'src/modules/provider/dto/response/provider-response.dto';
import { CreateProviderDto } from 'src/modules/provider/dto/request/create-provider.dto';
import { FindOptionsWhere, Not } from 'typeorm';
import { ProviderPendingRequestDetailsResponseDto } from 'src/modules/provider/dto/response/provider-pending-request-details-response.dto';
import { DocumentTranslationMapper } from './document-translation.mapper';
import { DocumentEntity } from 'src/modules/document/entities/document.entity';
import { UpdateProviderDto } from 'src/modules/provider/dto/request/update-provider.dto';
import { DuplicateFieldMapping } from 'src/libs/base-service/interfaces/duplicate-validation.interface';
import { CityTranslationMapper } from './city-translation.mapper';
import { ProviderDetailsResponseDto } from 'src/modules/provider/dto/response/provider-details-response.dto';

export class ProviderTranslationMapper {
  static readonly duplicateFieldsMapping: DuplicateFieldMapping<
    ProviderEntity,
    CreateProviderDto | UpdateProviderDto
  >[] = [
    { entityField: 'nameAr', dtoField: 'name.ar' },
    { entityField: 'nameEn', dtoField: 'name.en' },
    {
      entityField: 'commercialRegistrationNumber',
      dtoField: 'commercialRegistrationNumber',
    },
    {
      entityField: 'recruitmentLicenseNumber',
      dtoField: 'recruitmentLicenseNumber',
    },
  ];

  static toEntity(dto: CreateProviderDto): Partial<ProviderEntity> {
    return {
      nameAr: dto.name.ar,
      nameEn: dto.name.en,

      logoId: dto.documents.logoId,

      commercialRegistrationNumber: dto.commercialRegistrationNumber,

      recruitmentLicenseNumber: dto.recruitmentLicenseNumber,

      commercialRegistrationDocumentId:
        dto.documents.commercialRegistrationDocumentId,

      recruitmentLicenseDocumentId: dto.documents.recruitmentLicenseDocumentId,

      nationalAddressProofDocumentId:
        dto.documents.nationalAddressProofDocumentId,

      ibanCertificateDocumentId: dto.documents.ibanCertificateDocumentId,

      vatCertificateDocumentId: dto.documents.vatCertificateDocumentId,
    };
  }

  static toResponse(entity: ProviderEntity): ProviderResponseDto {
    const i18n = I18nContext.current();
    const lang = i18n?.lang ?? DEFAULT_LANGUAGE;
    const response: ProviderResponseDto = {
      id: entity.id,
      name: lang === 'en' ? entity.nameEn : entity.nameAr,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    return response;
  }

  static toResponses(entities: ProviderEntity[], type: 'joinRequests' | 'accepted' = 'joinRequests'): ProviderResponseDto[] {
    const responses = entities.map((entity) => {
      const branch = entity.branches?.[0];
      
      const response = {
        ...this.toResponse(entity),
        city: CityTranslationMapper.toResponse(branch.city),
        logo: entity.logo ? entity.logo.fullUrl() : null,
      };

      if(type === 'accepted') {
        response.totalOrders = 150;
        response.balance = '1000';
      }

      return response
    });

    return responses
  }

  static toUniqueWhere(
    dto: CreateProviderDto | UpdateProviderDto,
    excludeId?: string,
  ): FindOptionsWhere<ProviderEntity>[] {
    const conditions: FindOptionsWhere<ProviderEntity>[] = [];

    if (dto.name?.ar) {
      conditions.push({
        nameAr: dto.name.ar,
        ...(excludeId && { id: Not(excludeId) }),
      });
    }
    if (dto.name?.en) {
      conditions.push({
        nameEn: dto.name.en,
        ...(excludeId && { id: Not(excludeId) }),
      });
    }

    if (dto.commercialRegistrationNumber) {
      conditions.push({
        commercialRegistrationNumber: dto.commercialRegistrationNumber,
        ...(excludeId && { id: Not(excludeId) }),
      });
    }

    if (dto.recruitmentLicenseNumber) {
      conditions.push({
        recruitmentLicenseNumber: dto.recruitmentLicenseNumber,
        ...(excludeId && { id: Not(excludeId) }),
      });
    }

    return conditions;
  }

  static toPendingRequestResponse(
    entity: ProviderEntity,
  ): ProviderPendingRequestDetailsResponseDto {
    const owner = entity.admins[0]?.user;

    return {
      id: entity.id,
      name: {
        ar: entity.nameAr || '',
        en: entity.nameEn || '',
      },
      city: CityTranslationMapper.toResponse(entity.branches[0].city),
      status: entity.status,
      commercialRegistrationNumber: entity.commercialRegistrationNumber,
      recruitmentLicenseNumber: entity.recruitmentLicenseNumber,
      address: {
        ar: entity.branches[0]?.addressAr || '',
        en: entity.branches[0]?.addressEn || '',
      },
      rejectionReason: entity.rejectionReason,
      documents: {
        logo: DocumentTranslationMapper.toResponse(
          entity.logo as DocumentEntity,
        ),
        commercialRegistrationDocument: DocumentTranslationMapper.toResponse(
          entity.commercialRegistrationDocument,
        ),
        recruitmentLicenseDocument: DocumentTranslationMapper.toResponse(
          entity.recruitmentLicenseDocument,
        ),
        nationalAddressProofDocument: DocumentTranslationMapper.toResponse(
          entity.nationalAddressProofDocument,
        ),
        ibanCertificateDocument: DocumentTranslationMapper.toResponse(
          entity.ibanCertificateDocument,
        ),
        vatCertificateDocument: entity.vatCertificateDocument
          ? DocumentTranslationMapper.toResponse(entity.vatCertificateDocument)
          : null,
      },
      owner: {
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email ?? '',
        phoneNumber: owner.phoneNumber,
      },
    };
  }

  static toUpdateEntity(
    entity: ProviderEntity,
    dto: UpdateProviderDto,
  ): ProviderEntity {
    if (dto.name) {
      entity.nameAr = dto.name.ar;
      entity.nameEn = dto.name.en;
    }

    if (dto.commercialRegistrationNumber) {
      entity.commercialRegistrationNumber = dto.commercialRegistrationNumber;
    }

    if (dto.recruitmentLicenseNumber) {
      entity.recruitmentLicenseNumber = dto.recruitmentLicenseNumber;
    }

    if (dto.documents) {
      if (dto.documents.logoId) {
        entity.logoId = dto.documents.logoId;
      }
      if (dto.documents.commercialRegistrationDocumentId) {
        entity.commercialRegistrationDocumentId =
          dto.documents.commercialRegistrationDocumentId;
      }
      if (dto.documents.recruitmentLicenseDocumentId) {
        entity.recruitmentLicenseDocumentId =
          dto.documents.recruitmentLicenseDocumentId;
      }
      if (dto.documents.nationalAddressProofDocumentId) {
        entity.nationalAddressProofDocumentId =
          dto.documents.nationalAddressProofDocumentId;
      }
      if (dto.documents.ibanCertificateDocumentId) {
        entity.ibanCertificateDocumentId =
          dto.documents.ibanCertificateDocumentId;
      }
      if (dto.documents.vatCertificateDocumentId) {
        entity.vatCertificateDocumentId =
          dto.documents.vatCertificateDocumentId;
      }
    }

    return entity;
  }

  static providerDetailsResponse(entity: ProviderEntity): ProviderDetailsResponseDto {
    const owner = entity.admins[0]?.user;
    const i18n = I18nContext.current();
    const lang = i18n?.lang ?? DEFAULT_LANGUAGE;

    return {
        ...this.toResponse(entity),
        ...{
          commercialRegistrationNumber: entity.commercialRegistrationNumber,
          recruitmentLicenseNumber: entity.recruitmentLicenseNumber,
          whiteLabelUrl: 'https://localhost:3000',
          owner: {
            firstName: owner.firstName,
            lastName: owner.lastName,
            email: owner.email ?? '',
            phoneNumber: owner.phoneNumber,
          },
          city: CityTranslationMapper.toResponse(entity.branches[0].city),
          address: lang === 'en' ? entity.branches[0]?.addressEn : entity.branches[0]?.addressAr,
        }
      }
  }
}
