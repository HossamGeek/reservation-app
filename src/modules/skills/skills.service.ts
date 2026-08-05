import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/request/create-skill.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { getSkillsPaginationConfig } from 'src/libs/pagination/skills.pagination';
import { SkillTranslationMapper } from 'src/libs/mappers/skill-translation.mapper';
import { BaseDuplicateValidationService } from 'src/libs/base-service/base-duplicate-validation.service';

@Injectable()
export class SkillsService extends BaseDuplicateValidationService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    i18n: I18nService,
  ) {
    super(i18n);
  }


  async findAll(query: PaginateQuery): Promise<Paginated<Skill>> {
    const queryBuilder = this.skillsRepository.createQueryBuilder('skill');
    const result = await paginate(
      query,
      queryBuilder,
      getSkillsPaginationConfig,
    );

    result.data = SkillTranslationMapper.toResponses(
      result.data,
    ) as unknown as Skill[];

    return result;
  }

  async create(createSkillDto: CreateSkillDto): Promise<void> {
    const existingSkill = await this.skillsRepository.findOne({
      where: SkillTranslationMapper.toUniqueWhere(createSkillDto),
    });

    this.validateDuplicates(
      existingSkill,
      createSkillDto,
      SkillTranslationMapper.duplicateFieldsMapping,
      'skill.alreadyExists',
    );

    const entity = this.skillsRepository.create(
      SkillTranslationMapper.toEntity(createSkillDto),
    );

    await this.skillsRepository.save(entity);
  }

  async updateStatus(
    id: string,
    updateSkillStatusDto: UpdateStatusDto,
  ): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException(this.i18n.t('skills.notFound'));
    }

    skill.isActive = updateSkillStatusDto.isActive;

    return await this.skillsRepository.save(skill);
  }

  async updateBulkStatus(
    updateSkillStatusDto: UpdateStatusDto,
  ): Promise<void> {
    const result = await this.skillsRepository
      .createQueryBuilder()
      .update(Skill)
      .set({ isActive: updateSkillStatusDto.isActive })
      .execute();

    if (!result.affected) {
      throw new NotFoundException(this.i18n.t('skills.notFound'));
    }
  }

}
