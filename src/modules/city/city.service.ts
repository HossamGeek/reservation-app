import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { BaseEntityService } from 'src/libs/base-service/base-entity.service';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { getCitiesPaginationConfig } from 'src/libs/pagination/cities.pagination';
import { Repository } from 'typeorm';
import { CityTranslationMapper } from '../../libs/mappers/city-translation.mapper';
import { CountryService } from '../country/country.service';
import { CreateCityDto } from './dto/request/create-city.dto';
import { CityResponseDto } from './dto/response/city-response.dto';
import { CityEntity } from './entities/city.entity';

@Injectable()
export class CityService extends BaseEntityService<CityEntity> {
  constructor(
    @InjectRepository(CityEntity)
    repository: Repository<CityEntity>,
    private readonly countryService: CountryService,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<CityEntity>> {
    const queryBuilder = this.repository
      .createQueryBuilder('city')
      .leftJoinAndSelect('city.country', 'country');

    const result = await paginate(
      query,
      queryBuilder,
      getCitiesPaginationConfig,
    );

    // Convert cities to localized response based on current language
    result.data = CityTranslationMapper.toResponses(
      result.data,
    ) as unknown as CityEntity[];

    return result;
  }

  async getSaudiArabiaCities(
    query: PaginateQuery,
  ): Promise<Paginated<CityResponseDto>> {
    const sanitizedQuery = {
      ...query,
      search: query.search?.trim() || undefined,
    };

    const queryBuilder = this.repository
      .createQueryBuilder('city')
      .leftJoin('city.country', 'country')
      .select(['city.id', 'city.nameAr', 'city.nameEn', 'city.isActive'])
      .where('country.code = :countryCode', {
        countryCode: 'SA',
      })
      .andWhere('city.isActive = :isActive', {
        isActive: true,
      });

    const result = await paginate(
      sanitizedQuery,
      queryBuilder,
      getCitiesPaginationConfig,
    );

    const mappedData: CityResponseDto[] = CityTranslationMapper.toResponses(
      result.data,
    );

    return { ...result, data: mappedData } as Paginated<CityResponseDto>;
  }

  async updateStatus(id: string, status: boolean): Promise<void> {
    const city = await this.repository.findOne({
      where: { id },
    });

    if (!city) {
      throw new NotFoundException(this.i18n.t('cities.notFound'));
    }

    city.isActive = status;

    await this.repository.save(city);
  }

  async updateBulkStatus(dto: UpdateStatusDto): Promise<void> {
    const result = await this.repository
      .createQueryBuilder()
      .update(CityEntity)
      .set({ isActive: dto.isActive })
      .execute();

    if (!result.affected) {
      throw new NotFoundException(this.i18n.t('cities.notFound'));
    }
  }

  async create(dto: CreateCityDto): Promise<void> {
    await this.checkCountryExists(dto.countryId);
    const existingCity = await this.findOneBy({
      where: CityTranslationMapper.toUniqueWhere(dto).map(
        (translatedNameClause) => ({
          ...translatedNameClause,
          countryId: dto.countryId,
        }),
      ),
    });
    this.validateDuplicates(
      existingCity,
      dto,
      CityTranslationMapper.duplicateFieldsMapping,
      'cities.errors.duplicate',
    );

    const entity = CityTranslationMapper.toEntity(dto);

    await this.repository.save(entity);
  }

  private async checkCountryExists(countryId: string): Promise<void> {
    await this.countryService.findOneByOrFail({
      where: { id: countryId },
    });
  }
  protected getNotFoundMessage(): string {
    return this.i18n.t('cities.notFound');
  }

}
