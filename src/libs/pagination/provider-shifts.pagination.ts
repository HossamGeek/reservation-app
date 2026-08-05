import { PaginateConfig } from 'nestjs-paginate';
import { ShiftEntity } from 'src/modules/shifts/entities/shift.entity';

export const getProviderShiftsPaginationConfig: PaginateConfig<ShiftEntity> = {
  sortableColumns: ['id'],
  searchableColumns: ['name'],
  filterableColumns: {
    status: true,
  },
  defaultSortBy: [
    ['createdAt', 'DESC'],
    ['id', 'DESC'],
  ],
  defaultLimit: 20,
  maxLimit: 100,
};
