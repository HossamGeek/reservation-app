import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { BaseEntityService } from 'src/libs/base-service/base-entity.service';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { DocumentEntityTypeEnum } from 'src/libs/enums/document-entity-type.enum';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import { ServiceTypeOptionTranslationMapper } from 'src/libs/mappers/service-type-option-translation.mapper';
import { EntityManager, Repository } from 'typeorm';
import { DocumentService } from '../document/document.service';
import { CreateServiceTypeOptionDto } from './dto/request/create-service-type-option.dto';
import { ServiceTypeOptionEntity } from './entities/service-type-option.entity';
import { ServiceTypeService } from './service-type.service';

@Injectable()
export class ServiceTypeOptionService extends BaseEntityService<ServiceTypeOptionEntity> {
  constructor(
    @InjectRepository(ServiceTypeOptionEntity)
    repository: Repository<ServiceTypeOptionEntity>,
    private readonly serviceTypeService: ServiceTypeService,
    private readonly documentService: DocumentService,
    private readonly entityManager: EntityManager,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async create(
    createServiceTypeOptionDto: CreateServiceTypeOptionDto,
  ): Promise<void> {
    await this.checkServiceTypeSupportsOption(
      createServiceTypeOptionDto.serviceTypeId,
    );
    await this.checkDuplicateName(createServiceTypeOptionDto);

    await this.validateLogo(createServiceTypeOptionDto.logoId);

    const entity = this.repository.create(
      ServiceTypeOptionTranslationMapper.toEntity(createServiceTypeOptionDto),
    );

    await this.entityManager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(entity);

      if (createServiceTypeOptionDto.logoId) {
        await this.documentService.markAsUsed(
          [createServiceTypeOptionDto.logoId],
          DocumentEntityTypeEnum.ServiceTypeOption,
          entity.id,
          transactionalEntityManager,
          DocumentStatusEnum.Approved,
        );
      }
    });
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<void> {
    const serviceTypeOption = await this.findOneByOrFail({
      where: { id },
    });

    serviceTypeOption.isActive = dto.isActive;
    await this.repository.save(serviceTypeOption);
  }

  private async checkServiceTypeSupportsOption(
    serviceTypeId: string,
  ): Promise<void> {
    const serviceType = await this.serviceTypeService.findOneByOrFail({
      where: { id: serviceTypeId },
    });

    if (!serviceType.supportsOptions) {
      throw new UnprocessableEntityException({
        message: this.i18n.t('services-types.errors.doesNotSupportOptions'),
      });
    }
  }

  private async checkDuplicateName(
    dto: CreateServiceTypeOptionDto,
  ): Promise<void> {
    const existingEntity = await this.findOneBy({
      where: ServiceTypeOptionTranslationMapper.toUniqueWhere(dto).map(
        (translatedNameClause) => ({
          ...translatedNameClause,
          serviceTypeId: dto.serviceTypeId,
        }),
      ),
    });

    this.validateDuplicates(
      existingEntity,
      dto,
      ServiceTypeOptionTranslationMapper.duplicateFieldsMapping,
      'service-type-options.errors.duplicateName',
    );
  }

  private async validateLogo(logoId?: string): Promise<void> {
    if (logoId) {
      const logo = await this.documentService.findOne(logoId);

      if (!logo) {
        throw new NotFoundException(
          this.i18n.t('service-type-options.errors.logoNotFound'),
        );
      }

      if (logo.status !== DocumentStatusEnum.Pending || logo.isUsed) {
        throw new UnprocessableEntityException(
          this.i18n.t('service-type-options.errors.logoAlreadyUsed'),
        );
      }
    }
  }
  protected getNotFoundMessage(): string {
    return this.i18n.t('service-type-options.errors.notFound');
  }
}
