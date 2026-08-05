import { PaginateConfig } from 'nestjs-paginate';
import { CountryEntity } from 'src/modules/country/entities/country.entity';

export const getCountriesPaginationConfig: PaginateConfig<CountryEntity> = {
  filterableColumns: {
    isActive: true,
  },
  searchableColumns: ['nameEn', 'nameAr'],
  defaultSortBy: [
    ['isActive', 'DESC'],
    ['nameEn', 'ASC'],
  ],
  sortableColumns: ['id'],
  maxLimit: 100,
  defaultLimit: 20,
};

export const getCountriesWithCitiesPaginationConfig: PaginateConfig<CountryEntity> =
  {
    filterableColumns: {
      isActive: true,
      'cities.isActive': true,
    },
    searchableColumns: ['nameEn', 'nameAr', 'cities.nameEn', 'cities.nameAr'],
    defaultSortBy: [
      ['isActive', 'DESC'],
      ['nameEn', 'ASC'],
    ],
    sortableColumns: ['id'],
    maxLimit: 100,
    defaultLimit: 20,
    relations: { cities: true },
  };
