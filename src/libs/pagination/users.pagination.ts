import { PaginateConfig } from 'nestjs-paginate';
import { UserEntity } from 'src/modules/user/entities/user.entity';

export const getUsersPaginationConfig: PaginateConfig<UserEntity> = {
  sortableColumns: ['id', 'createdAt'],
  searchableColumns: ['email'],
};
