import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { BaseEntityFinderService } from 'src/libs/base-service/base-entity-finder.service';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { ExperienceMapper } from 'src/libs/mappers/experience.mapper';
import { getExperiencesPaginationConfig } from 'src/libs/pagination/experiences.pagination';
import { Repository } from 'typeorm';
import { UpdateExperienceDto } from './dto/request/update-experience.dto';
import { ExperienceResponseDto } from './dto/respose/experience-response.dto';
import { ExperienceEntity } from './entities/experience.entity';

@Injectable()
export class ExperienceService extends BaseEntityFinderService<ExperienceEntity> {
  constructor(
    @InjectRepository(ExperienceEntity)
    repository: Repository<ExperienceEntity>,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  private validateMinMax(minYears: number, maxYears?: number | null): void {
    if (maxYears !== undefined && maxYears !== null && maxYears <= minYears) {
      throw new UnprocessableEntityException({
        maxYears: [this.i18n.t('experiences.errors.invalidRange')],
      });
    }
  }

  // async create(dto: CreateExperienceDto): Promise<void> {
  //   const minYears = dto.minYears;
  //   const maxYears = dto.maxYears ?? null;

  //   this.validateMinMax(minYears, maxYears);

  //   const entity = this.repository.create({
  //     minYears,
  //     maxYears,
  //     isActive: false,
  //   });

  //   await this.repository.save(entity);
  // }

  async findAll(
    query: PaginateQuery,
  ): Promise<Paginated<ExperienceResponseDto>> {
    const queryBuilder =
      this.repository.createQueryBuilder('experience');

    const result = await paginate(
      query,
      queryBuilder,
      getExperiencesPaginationConfig,
    );

    const mappedData = ExperienceMapper.toResponses(result.data);

    return {
      ...result,
      data: mappedData,
    } as unknown as Paginated<ExperienceResponseDto>;
  }

  async update(id: string, dto: UpdateExperienceDto): Promise<void> {
    const experience = await this.findOneByOrFail({
      where: { id },
    });

    const minYears =
      dto.minYears !== undefined ? dto.minYears : experience.minYears;
    const maxYears =
      dto.maxYears !== undefined ? dto.maxYears : experience.maxYears;

    this.validateMinMax(minYears, maxYears);

    experience.minYears = minYears;
    experience.maxYears = maxYears;

    await this.repository.save(experience);
  }

  async updateStatus(id: string, isActive: boolean): Promise<void> {
    const experience = await this.repository.findOne({
      where: { id },
    });

    if (!experience) {
      throw new NotFoundException(this.i18n.t('experiences.notFound'));
    }

    experience.isActive = isActive;
    await this.repository.save(experience);
  }

  async updateBulkStatus(dto: UpdateStatusDto): Promise<void> {
    const result = await this.repository
      .createQueryBuilder()
      .update(ExperienceEntity)
      .set({ isActive: dto.isActive })
      .execute();

    if (!result.affected) {
      throw new NotFoundException(this.i18n.t('experiences.notFound'));
    }
  }
  protected getNotFoundMessage(): string {
    return this.i18n.t('experiences.notFound');
  }
}
