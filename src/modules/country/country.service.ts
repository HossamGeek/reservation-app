import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryEntity } from './entities/country.entity';
import { I18nService } from 'nestjs-i18n';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import {
  getCountriesPaginationConfig,
  getCountriesWithCitiesPaginationConfig,
} from 'src/libs/pagination/countries.pagination';
import { CountryTranslationMapper } from '../../libs/mappers/country-translation.mapper';
import { CountryResponseDto } from './dto/response/country-response.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { BaseEntityFinderService } from 'src/libs/base-service/base-entity-finder.service';

@Injectable()
export class CountryService extends BaseEntityFinderService<CountryEntity> {
  constructor(
    @InjectRepository(CountryEntity)
    repository: Repository<CountryEntity>,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<CountryEntity>> {
    const queryBuilder = this.repository.createQueryBuilder('country');
    const result = await paginate(
      query,
      queryBuilder,
      getCountriesPaginationConfig,
    );

    // Convert countries to localized response based on current language
    result.data = CountryTranslationMapper.toResponses(
      result.data,
    ) as unknown as CountryEntity[];

    return result;
  }

  async updateStatus(id: string, status: boolean): Promise<void> {
    const country = await this.repository.findOne({
      where: { id },
    });

    if (!country) {
      throw new NotFoundException(this.i18n.t('countries.notFound'));
    }

    country.isActive = status;

    await this.repository.save(country);
  }

  async updateBulkStatus(dto: UpdateStatusDto): Promise<void> {
    const result = await this.repository
      .createQueryBuilder()
      .update(CountryEntity)
      .set({ isActive: dto.isActive })
      .execute();

    if (!result.affected) {
      throw new NotFoundException(this.i18n.t('countries.notFound'));
    }
  }

  async findWithCities(
    query: PaginateQuery,
  ): Promise<Paginated<CountryResponseDto>> {
    const queryBuilder = this.repository
      .createQueryBuilder('country')
      .leftJoinAndSelect('country.cities', 'cities')
      .where('country.isActive = :isActive', { isActive: true });

    const result = await paginate(
      query,
      queryBuilder,
      getCountriesWithCitiesPaginationConfig,
    );

    const mappedData = CountryTranslationMapper.toResponses(result.data);

    return {
      ...result,
      data: mappedData,
    } as unknown as Paginated<CountryResponseDto>;
  }

  protected getNotFoundMessage(): string {
    return this.i18n.t('countries.notFound');
  }

}
