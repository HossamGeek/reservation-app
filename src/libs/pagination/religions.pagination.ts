import { PaginateConfig } from 'nestjs-paginate';
import { ReligionEntity } from 'src/modules/religion/entities/religion.entity';

export const getReligionsPaginationConfig: PaginateConfig<ReligionEntity> = {
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
