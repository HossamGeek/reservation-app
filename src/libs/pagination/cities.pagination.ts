import { PaginateConfig } from 'nestjs-paginate';
import { CityEntity } from 'src/modules/city/entities/city.entity';

export const getCitiesPaginationConfig: PaginateConfig<CityEntity> = {
  filterableColumns: {
    isActive: true,
    countryId: true,
  },
  searchableColumns: ['nameEn', 'nameAr'],
  defaultSortBy: [
    ['isActive', 'DESC'],
    ['nameAr', 'ASC'],
  ],
  sortableColumns: ['id'],
  maxLimit: 100,
  defaultLimit: 20,
};