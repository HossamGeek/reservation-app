import { PaginateConfig } from 'nestjs-paginate';
import { LanguageEntity } from 'src/modules/languages/entities/language.entity';

export const languagesPaginationConfig: PaginateConfig<LanguageEntity> = {
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
