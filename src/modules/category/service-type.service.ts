import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { BaseEntityFinderService } from 'src/libs/base-service/base-entity-finder.service';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { ServiceTypeTranslationMapper } from 'src/libs/mappers/service-type-translation.mapper';
import { getServiceTypesPaginationConfig } from 'src/libs/pagination/services-types.pagination';
import { Repository } from 'typeorm';
import { ServiceTypeEntity } from './entities/service-type.entity';

@Injectable()
export class ServiceTypeService extends BaseEntityFinderService<ServiceTypeEntity> {
  constructor(
    @InjectRepository(ServiceTypeEntity)
    repository: Repository<ServiceTypeEntity>,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async findAll(
    query: PaginateQuery,
    options?: { isMobile: boolean },
  ): Promise<Paginated<ServiceTypeEntity>> {
    const queryBuilder =
      this.repository.createQueryBuilder('serviceType');

    if (options?.isMobile) {
      // Only get active service types and their active options
      queryBuilder
        .leftJoinAndSelect(
          'serviceType.options',
          'options',
          'options.isActive = :isActive',
          { isActive: true },
        )
        .where('serviceType.isActive = :isActive', {
          isActive: true,
        });
    } else {
      queryBuilder.leftJoinAndSelect('serviceType.options', 'options');
    }
    queryBuilder.leftJoinAndSelect('options.logo', 'logo');

    const result = await paginate(
      query,
      queryBuilder,
      getServiceTypesPaginationConfig,
    );

    // Convert service types to localized response based on current language
    result.data = ServiceTypeTranslationMapper.toResponses(
      result.data,
    ) as unknown as ServiceTypeEntity[];

    return result;
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<void> {
    const serviceTypeOption = await this.findOneBy({
      where: { id },
    });

    if (!serviceTypeOption) {
      throw new NotFoundException(
        this.i18n.t('services-types.errors.notFound'),
      );
    }

    serviceTypeOption.isActive = dto.isActive;
    await this.repository.save(serviceTypeOption);
  }

  protected getNotFoundMessage(): string {
    return this.i18n.t('services-types.errors.notFound');
  }
}
