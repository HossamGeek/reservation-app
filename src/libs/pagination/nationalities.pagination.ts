import { PaginateConfig } from 'nestjs-paginate';
import { NationalityEntity } from 'src/modules/nationality/entities/nationality.entity';

export const getNationalitiesPaginationConfig: PaginateConfig<NationalityEntity> = {
  filterableColumns: {
    isActive: true,
  },
  searchableColumns: ['nameEn', 'nameAr'],
  defaultSortBy: [
    ['isActive', 'DESC'],
    ['nameEn', 'ASC'],
  ],
  sortableColumns: ['id', 'nameEn', 'nameAr'],
  maxLimit: 100,
  defaultLimit: 20,
};
