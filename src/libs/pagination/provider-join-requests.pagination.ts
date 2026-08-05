import { PaginateConfig } from 'nestjs-paginate';
import { ProviderEntity } from 'src/modules/provider/entities/provider.entity';

export const getProviderRequestsPaginationConfig: PaginateConfig<ProviderEntity> = {
  filterableColumns: {
    status: true,
    createdAt: true,
  },
  searchableColumns: ['nameEn', 'nameAr'],
  defaultSortBy: [
    ['createdAt', 'DESC'],
  ],
  sortableColumns: ['id', 'createdAt', 'nameEn', 'nameAr'],
  maxLimit: 100,
  defaultLimit: 20,
};
