import { PaginateConfig } from 'nestjs-paginate';
import { PositionEntity } from 'src/modules/position/entities/position.entity';

export const getPositionsPaginationConfig: PaginateConfig<PositionEntity> = {
  filterableColumns: {
    isActive: true,
  },
  searchableColumns: ['nameEn', 'nameAr'],
  defaultSortBy: [
    ['isActive', 'DESC'],
    ['id', 'ASC'],
  ],
  sortableColumns: ['id', 'nameEn', 'nameAr'],
  maxLimit: 100,
  defaultLimit: 20,
};
