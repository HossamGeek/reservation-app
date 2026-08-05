import { PaginateConfig } from 'nestjs-paginate';
import { ServiceEntity } from 'src/modules/service/entities/service.entity';

export const getServicesPaginationConfig: PaginateConfig<ServiceEntity> = {
  filterableColumns: {
    isActive: true,
    categoryId: true,
    serviceTypeId: true,
  },
  searchableColumns: ['nameEn', 'nameAr'],
  defaultSortBy: [['id', 'DESC']],
  sortableColumns: ['id', 'categoryId', 'serviceTypeId'],
  maxLimit: 100,
  defaultLimit: 20,
  relations: { category: true, serviceType: true, logo: true },
};
