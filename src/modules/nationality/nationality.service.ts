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
import { NationalityTranslationMapper } from 'src/libs/mappers/nationality-translation.mapper';
import { getNationalitiesPaginationConfig } from 'src/libs/pagination/nationalities.pagination';
import { Repository } from 'typeorm';
import { CreateNationalityDto } from './dto/request/create-nationality.dto';
import { NationalityResponseDto } from './dto/respose/nationality-response.dto';
import { NationalityEntity } from './entities/nationality.entity';

@Injectable()
export class NationalityService extends BaseEntityFinderService<NationalityEntity> {
  constructor(
    @InjectRepository(NationalityEntity)
    repository: Repository<NationalityEntity>,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async create(dto: CreateNationalityDto): Promise<void> {
    const existingNationality = await this.findOneBy({
      where: NationalityTranslationMapper.toUniqueWhere(dto),
    });

    if (existingNationality) {
      throw new UnprocessableEntityException({
        message: this.i18n.t('nationalities.alreadyExists'),
        fields: this.getDuplicateFields(existingNationality, dto),
      });
    }

    const entity = NationalityTranslationMapper.toEntity(dto);

    await this.repository.save(entity);
  }

  async findAll(
    query: PaginateQuery,
  ): Promise<Paginated<NationalityResponseDto>> {
    const queryBuilder =
      this.repository.createQueryBuilder('nationality');

    const result = await paginate(
      query,
      queryBuilder,
      getNationalitiesPaginationConfig,
    );

    const mappedData = NationalityTranslationMapper.toResponses(result.data);

    return {
      ...result,
      data: mappedData,
    } as unknown as Paginated<NationalityResponseDto>;
  }

  async updateStatus(id: string, isActive: boolean): Promise<void> {
    const nationality = await this.findOneByOrFail({
      where: { id },
    });
    nationality.isActive = isActive;
    await this.repository.save(nationality);
  }

  async updateBulkStatus(dto: UpdateStatusDto): Promise<void> {
    const result = await this.repository
      .createQueryBuilder()
      .update(NationalityEntity)
      .set({ isActive: dto.isActive })
      .execute();

    if (!result.affected) {
      throw new NotFoundException(this.i18n.t('nationalities.notFound'));
    }
  }

  private getDuplicateFields(
    existing: NationalityEntity,
    dto: CreateNationalityDto,
  ): string[] {
    const fields: string[] = [];

    if (existing.nameAr === dto.name.ar) {
      fields.push('name.ar');
    }

    if (existing.nameEn === dto.name.en) {
      fields.push('name.en');
    }

    return fields;
  }
  protected getNotFoundMessage(): string {
    return this.i18n.t('nationalities.notFound');
  }
}
