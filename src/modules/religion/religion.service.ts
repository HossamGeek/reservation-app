import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { BaseEntityService } from 'src/libs/base-service/base-entity.service';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { ReligionMapper } from 'src/libs/mappers/religion.mapper';
import { getReligionsPaginationConfig } from 'src/libs/pagination/religions.pagination';
import { Not, Repository } from 'typeorm';
import { CreateReligionDto } from './dto/request/create-religion.dto';
import { UpdateReligionDto } from './dto/request/update-religion.dto';
import { ReligionResponseDto } from './dto/respose/religion-response.dto';
import { ReligionEntity } from './entities/religion.entity';

@Injectable()
export class ReligionService extends BaseEntityService<ReligionEntity> {
  constructor(
    @InjectRepository(ReligionEntity)
    repository: Repository<ReligionEntity>,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async create(dto: CreateReligionDto): Promise<void> {
    const existReligion = await this.findOneBy({
      where: ReligionMapper.toUniqueWhere(dto),
    });

    this.validateDuplicates(
      existReligion,
      dto,
      ReligionMapper.duplicateFieldsMapping,
      'religions.alreadyExists',
    );

    const entity = this.repository.create(ReligionMapper.toEntity(dto));

    await this.repository.save(entity);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<ReligionResponseDto>> {
    const queryBuilder = this.repository.createQueryBuilder('religion');

    const result = await paginate(
      query,
      queryBuilder,
      getReligionsPaginationConfig,
    );

    const mappedData = ReligionMapper.toResponses(result.data);

    return {
      ...result,
      data: mappedData,
    } as unknown as Paginated<ReligionResponseDto>;
  }

  async update(id: string, dto: UpdateReligionDto): Promise<void> {
    const religion = await this.repository.findOne({
      where: { id },
    });

    if (!religion) {
      throw new NotFoundException(this.i18n.t('religions.notFound'));
    }

    if (dto.name) {
      const existReligion = await this.repository.findOne({
        where: ReligionMapper.toUniqueWhere({ name: dto.name }).map(
          (translatedNameClause) => ({
            ...translatedNameClause,
            id: Not(id),
          }),
        ),
      });

      if (existReligion) {
        this.validateDuplicates(
          existReligion,
          dto,
          ReligionMapper.duplicateFieldsMapping,
          'religions.alreadyExists',
        );
      }

      if (dto.name.ar !== undefined) {
        religion.nameAr = dto.name.ar;
      }
      if (dto.name.en !== undefined) {
        religion.nameEn = dto.name.en;
      }
    }

    await this.repository.save(religion);
  }

  async updateStatus(id: string, isActive: boolean): Promise<void> {
    const religion = await this.repository.findOne({
      where: { id },
    });

    if (!religion) {
      throw new NotFoundException(this.i18n.t('religions.notFound'));
    }

    religion.isActive = isActive;
    await this.repository.save(religion);
  }

  async updateBulkStatus(dto: UpdateStatusDto): Promise<void> {
    const result = await this.repository
      .createQueryBuilder()
      .update(ReligionEntity)
      .set({ isActive: dto.isActive })
      .execute();

    if (!result.affected) {
      throw new NotFoundException(this.i18n.t('religions.notFound'));
    }
  }

  protected getNotFoundMessage(): string {
    return this.i18n.t('religions.notFound');
  }
}
