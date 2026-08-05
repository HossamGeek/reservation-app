import { PaginateConfig } from 'nestjs-paginate';
import { BranchEntity } from 'src/modules/branch/entities/branch.entity';

export const getBranchesPaginationConfig: PaginateConfig<BranchEntity> = {
  filterableColumns: {
    providerId: true,
    cityId: true,
    status: true,
  },
  searchableColumns: ['nameEn', 'nameAr'],
  defaultSortBy: [['createdAt', 'DESC']],
  sortableColumns: ['id'],
  maxLimit: 100,
  defaultLimit: 20,
};
