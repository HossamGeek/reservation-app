import { PaginateConfig } from 'nestjs-paginate';
import { CategoryEntity } from 'src/modules/category/entities/category.entity';

export const getCategoriesPaginationConfig: PaginateConfig<CategoryEntity> = {
  filterableColumns: {
    isActive: true,
    'services.serviceTypeId': true,
  },
  searchableColumns: ['nameEn', 'nameAr'],
  defaultSortBy: [
    ['isActive', 'DESC'],
    ['nameEn', 'ASC'],
  ],
  sortableColumns: ['id'],
  maxLimit: 100,
  defaultLimit: 20,
  relations: { logo: true, services: true },
};
