import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { BaseEntityService } from 'src/libs/base-service/base-entity.service';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { DocumentEntityTypeEnum } from 'src/libs/enums/document-entity-type.enum';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import { CategoryTranslationMapper } from 'src/libs/mappers/category-translation.mapper';
import { getCategoriesPaginationConfig } from 'src/libs/pagination/categories.pagination';
import { EntityManager, Not, Repository } from 'typeorm';
import { DocumentService } from '../document/document.service';
import { CreateCategoryDto } from './dto/request/create-category.dto';
import { UpdateCategoryDto } from './dto/request/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoryService extends BaseEntityService<CategoryEntity> {
  constructor(
    @InjectRepository(CategoryEntity)
    repository: Repository<CategoryEntity>,
    private readonly documentService: DocumentService,
    private readonly entityManager: EntityManager,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<void> {
    const existingCategory = await this.findOneBy({
      where: CategoryTranslationMapper.toUniqueWhere(createCategoryDto),
    });

    this.validateDuplicates(
      existingCategory,
      createCategoryDto,
      CategoryTranslationMapper.duplicateFieldsMapping,
      'categories.alreadyExists',
    );

    await this.validateLogo(createCategoryDto.logoId);

    const entity = this.repository.create(
      CategoryTranslationMapper.toEntity(createCategoryDto),
    );

    await this.entityManager.transaction(async (transactionalEntityManager) => {
      if (createCategoryDto.logoId) {
        await this.documentService.markAsUsed(
          [createCategoryDto.logoId],
          DocumentEntityTypeEnum.Category,
          entity.id,
          transactionalEntityManager,
          DocumentStatusEnum.Approved,
        );
      }

      await transactionalEntityManager.save(entity);
    });
  }

  async findAll(
    query: PaginateQuery,
    options?: { isMobile: boolean },
  ): Promise<Paginated<CategoryEntity>> {
    const queryBuilder = this.repository.createQueryBuilder('category');

    if (options?.isMobile) {
      queryBuilder.where('category.isActive = :isActive', { isActive: true });
    }
    const result = await paginate(
      query,
      queryBuilder,
      getCategoriesPaginationConfig,
    );

    // Convert categories to localized response based on current language
    result.data = CategoryTranslationMapper.toResponses(
      result.data,
    ) as unknown as CategoryEntity[];

    return result;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<void> {
    const category = await this.findOneByOrFail({ where: { id } });

    if (dto.name) {
      const existingCategory = await this.findOneBy({
        where: CategoryTranslationMapper.toUniqueWhere({
          name: dto.name,
        } as CreateCategoryDto).map((translatedNameClause) => ({
          ...translatedNameClause,
          id: Not(id),
        })),
      });

      this.validateDuplicates(
        existingCategory,
        { name: dto.name } as CreateCategoryDto,
        CategoryTranslationMapper.duplicateFieldsMapping,
        'categories.alreadyExists',
      );
    }

    if (dto.logoId) {
      await this.validateLogo(dto.logoId);
    }

    const updatedCategory = CategoryTranslationMapper.toUpdateEntity(
      category,
      dto,
    );

    await this.entityManager.transaction(async (transactionalEntityManager) => {
      if (dto.logoId) {
        await this.documentService.markAsUsed(
          [dto.logoId],
          DocumentEntityTypeEnum.Category,
          updatedCategory.id,
          transactionalEntityManager,
          DocumentStatusEnum.Approved,
        );
      }

      await transactionalEntityManager.save(updatedCategory);
    });
  }

  async updateStatus(
    id: string,
    updateCategoryStatusDto: UpdateStatusDto,
  ): Promise<void> {
    const category = await this.findOneByOrFail({ where: { id } });

    category.isActive = updateCategoryStatusDto.isActive;

    await this.repository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOneByOrFail({ where: { id } });

    await this.repository.remove(category);
  }

  private async validateLogo(logoId?: string): Promise<void> {
    if (logoId) {
      const logo = await this.documentService.findOne(logoId);

      if (!logo) {
        throw new NotFoundException(
          this.i18n.t('categories.errors.logoNotFound'),
        );
      }

      if (logo.status !== DocumentStatusEnum.Pending || logo.isUsed) {
        throw new UnprocessableEntityException(
          this.i18n.t('categories.errors.logoAlreadyUsed'),
        );
      }
    }
  }
  protected getNotFoundMessage(): string {
    return this.i18n.t('categories.notFound');
  }
}
