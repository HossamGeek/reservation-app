import { PaginateConfig } from 'nestjs-paginate';
import { ServiceTypeEntity } from 'src/modules/category/entities/service-type.entity';

export const getServiceTypesPaginationConfig: PaginateConfig<ServiceTypeEntity> =
  {
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
