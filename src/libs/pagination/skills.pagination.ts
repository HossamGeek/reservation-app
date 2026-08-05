import { PaginateConfig } from 'nestjs-paginate';
import { Skill } from 'src/modules/skills/entities/skill.entity';

export const getSkillsPaginationConfig: PaginateConfig<Skill> = {
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
