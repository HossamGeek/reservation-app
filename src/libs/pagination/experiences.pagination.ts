import { PaginateConfig } from 'nestjs-paginate';
import { ExperienceEntity } from 'src/modules/experience/entities/experience.entity';

export const getExperiencesPaginationConfig: PaginateConfig<ExperienceEntity> = {
  filterableColumns: {
    isActive: true,
  },
  defaultSortBy: [
    ['minYears', 'ASC'],
  ],
  sortableColumns: ['id', 'minYears', 'maxYears'],
  maxLimit: 100,
  defaultLimit: 20,
};
