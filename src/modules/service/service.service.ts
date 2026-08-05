import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { BaseEntityService } from 'src/libs/base-service/base-entity.service';
import { DocumentEntityTypeEnum } from 'src/libs/enums/document-entity-type.enum';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import { ServiceTranslationMapper } from 'src/libs/mappers/service-translation.mapper';
import { getServicesPaginationConfig } from 'src/libs/pagination/services.pagination';
import { DocumentService } from 'src/modules/document/document.service';
import { EntityManager, Repository } from 'typeorm';
import { CategoryService } from '../category/category.service';
import { ServiceTypeService } from '../category/service-type.service';
import { CreateServiceDto } from './dto/request/create-service.dto';
import { ServiceDetailsResponseDto } from './dto/response/service-details-response.dto';
import { ServicesStatisticsResponseDto } from './dto/response/services-statistics-response.dto';
import { ServiceEntity } from './entities/service.entity';

@Injectable()
export class ServiceService extends BaseEntityService<ServiceEntity> {
  constructor(
    @InjectRepository(ServiceEntity)
    repository: Repository<ServiceEntity>,
    private readonly categoryService: CategoryService,
    private readonly serviceTypeService: ServiceTypeService,
    private readonly documentService: DocumentService,
    i18n: I18nService,
    private readonly entityManager: EntityManager,
  ) {
    super(repository, i18n);
  }

  async create(dto: CreateServiceDto): Promise<void> {
    await this.categoryService.findOneByOrFail({
      where: { id: dto.categoryId },
    });
    await this.serviceTypeService.findOneByOrFail({
      where: { id: dto.serviceTypeId },
    });

    const existingService = await this.repository.findOne({
      where: ServiceTranslationMapper.toUniqueWhere(dto),
    });

    this.validateDuplicates(
      existingService,
      dto,
      ServiceTranslationMapper.duplicateFieldsMapping,
      'services.alreadyExists',
    );

    if (dto.logoId) {
      const document = await this.documentService.findOneBy({
        where: { id: dto.logoId },
      });

      if (document?.status !== DocumentStatusEnum.Pending) {
        throw new BadRequestException(
          this.i18n.t('documents.errors.alreadyUsed'),
        );
      }
    }

    const service = this.repository.create(
      ServiceTranslationMapper.toEntity(dto),
    );

    await this.entityManager.transaction(async (entityManager) => {
      const savedService = await entityManager.save(ServiceEntity, service);

      if (dto.logoId) {
        await this.documentService.markAsUsed(
          [dto.logoId],
          DocumentEntityTypeEnum.Service,
          savedService.id,
          entityManager,
          DocumentStatusEnum.Approved,
        );
      }
    });
  }

  async getStatistics(): Promise<ServicesStatisticsResponseDto> {
    const [activeServices, inactiveServices] = await Promise.all([
      this.repository.count({ where: { isActive: true } }),
      this.repository.count({ where: { isActive: false } }),
    ]);

    const totalServices = activeServices + inactiveServices;

    /**
     * TODO:
     * Replace with real service requests repository count after service requests module is ready.
     */
    const totalServiceRequests = 0;

    return {
      totalServices,
      activeServices,
      inactiveServices,
      totalServiceRequests,
    };
  }

  async findAll(
    query: PaginateQuery,
    options?: { isMobile: boolean },
  ): Promise<Paginated<ServiceEntity>> {
    const queryBuilder = this.repository.createQueryBuilder('service');
    if (options?.isMobile) {
      queryBuilder
        .leftJoin('service.category', 'category')
        .leftJoin('service.serviceType', 'serviceType')
        .where('service.isActive = :isActive', { isActive: true })
        .andWhere('category.isActive = :isActive', {
          isActive: true,
        })
        .andWhere('serviceType.isActive = :isActive', {
          isActive: true,
        });
    }
    const result = await paginate(
      query,
      queryBuilder,
      getServicesPaginationConfig,
    );

    result.data = ServiceTranslationMapper.toResponses(
      result.data,
    ) as unknown as ServiceEntity[];

    return result;
  }

  async findOne(id: string): Promise<ServiceDetailsResponseDto> {
    const service = await this.findOneByOrFail({
      where: { id },
      relations: {
        category: true,
        serviceType: {
          options: true,
        },
        logo: true,
      },
    });

    return ServiceTranslationMapper.toResponse(service);
  }

  async remove(id: string): Promise<void> {
    //TODO: Use findOneOrFail
    const service = await this.repository.findOne({
      where: { id },
      select: { id: true },
    });

    if (!service) {
      throw new NotFoundException(this.i18n.t('services.notFound'));
    }

    await this.repository.remove(service);
  }
  protected getNotFoundMessage(): string {
    return this.i18n.t('services.notFound');
  }
}
