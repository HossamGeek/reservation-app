import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { BaseEntityService } from 'src/libs/base-service/base-entity.service';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { PositionTranslationMapper } from 'src/libs/mappers/position-translation.mapper';
import { getPositionsPaginationConfig } from 'src/libs/pagination/positions.pagination';
import { Not, Repository } from 'typeorm';
import { CreatePositionDto } from './dto/request/create-position.dto';
import { UpdatePositionDto } from './dto/request/update-position.dto';
import { PositionResponseDto } from './dto/response/position-response.dto';
import { PositionEntity } from './entities/position.entity';

@Injectable()
export class PositionService extends BaseEntityService<PositionEntity> {
  constructor(
    @InjectRepository(PositionEntity)
    repository: Repository<PositionEntity>,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async create(dto: CreatePositionDto): Promise<void> {
    const existPosition = await this.findOneBy({
      where: PositionTranslationMapper.toUniqueWhere(dto),
    });

    this.validateDuplicates(
      existPosition,
      dto,
      PositionTranslationMapper.duplicateFieldsMapping,
      'positions.alreadyExists',
    );

    const entity = this.repository.create(
      PositionTranslationMapper.toEntity(dto),
    );

    await this.repository.save(entity);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<PositionResponseDto>> {
    const queryBuilder = this.repository.createQueryBuilder('position');

    const result = await paginate(
      query,
      queryBuilder,
      getPositionsPaginationConfig,
    );

    const mappedData = PositionTranslationMapper.toResponses(result.data);

    return {
      ...result,
      data: mappedData,
    } as unknown as Paginated<PositionResponseDto>;
  }

  async update(id: string, dto: UpdatePositionDto): Promise<void> {
    const position = await this.repository.findOne({
      where: { id },
    });

    if (!position) {
      throw new NotFoundException(this.i18n.t('positions.notFound'));
    }

    if (dto.name) {
      const existPosition = await this.repository.findOne({
        where: PositionTranslationMapper.toUniqueWhere({ name: dto.name }).map(
          (translatedNameClause) => ({
            ...translatedNameClause,
            id: Not(id),
          }),
        ),
      });

      if (existPosition) {
        this.validateDuplicates(
          existPosition,
          dto,
          PositionTranslationMapper.duplicateFieldsMapping,
          'positions.alreadyExists',
        );
      }

      if (dto.name.ar !== undefined) {
        position.nameAr = dto.name.ar;
      }
      if (dto.name.en !== undefined) {
        position.nameEn = dto.name.en;
      }
    }

    await this.repository.save(position);
  }

  async updateStatus(id: string, isActive: boolean): Promise<void> {
    const position = await this.repository.findOne({
      where: { id },
    });

    if (!position) {
      throw new NotFoundException(this.i18n.t('positions.notFound'));
    }

    position.isActive = isActive;
    await this.repository.save(position);
  }

  async updateBulkStatus(dto: UpdateStatusDto): Promise<void> {
    const result = await this.repository
      .createQueryBuilder()
      .update(PositionEntity)
      .set({ isActive: dto.isActive })
      .execute();

    if (!result.affected) {
      throw new NotFoundException(this.i18n.t('positions.notFound'));
    }
  }

  protected getNotFoundMessage(): string {
    return this.i18n.t('positions.notFound');
  }
}
