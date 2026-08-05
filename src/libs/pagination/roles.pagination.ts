import { PaginateConfig } from 'nestjs-paginate';
import { RoleEntity } from 'src/modules/role/entities/role.entity';

export const getRolesPaginationConfig: PaginateConfig<RoleEntity> = {
  sortableColumns: ['id', 'createdAt'],
  searchableColumns: ['name'],
};
