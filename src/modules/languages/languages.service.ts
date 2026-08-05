import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { BaseEntityService } from 'src/libs/base-service/base-entity.service';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { LanguageTranslationMapper } from 'src/libs/mappers/language-translation.mapper';
import { languagesPaginationConfig } from 'src/libs/pagination/languages.pagination';
import { Repository } from 'typeorm';
import { CreateLanguageDto } from './dto/request/create-language.dto';
import { LanguageEntity } from './entities/language.entity';

@Injectable()
export class LanguagesService extends BaseEntityService<LanguageEntity> {
  constructor(
    @InjectRepository(LanguageEntity)
    repository: Repository<LanguageEntity>,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async findAll(
    query: PaginateQuery,
  ): Promise<
    Paginated<ReturnType<typeof LanguageTranslationMapper.toResponse>>
  > {
    const queryBuilder =
      this.repository.createQueryBuilder('language');
    const result = await paginate(
      query,
      queryBuilder,
      languagesPaginationConfig,
    );

    return {
      ...result,
      data: LanguageTranslationMapper.toResponses(result.data),
    } as Paginated<ReturnType<typeof LanguageTranslationMapper.toResponse>>;
  }

  async create(createLanguageDto: CreateLanguageDto): Promise<LanguageEntity> {
    const existingLanguage = await this.findOneBy({
      where: LanguageTranslationMapper.toUniqueWhere(createLanguageDto),
    });

    this.validateDuplicates(
      existingLanguage,
      createLanguageDto,
      LanguageTranslationMapper.duplicateFieldsMapping,
      'languages.alreadyExists',
    );

    const entity = this.repository.create({
      ...LanguageTranslationMapper.toEntity(createLanguageDto),
      isActive: false,
    });

    return await this.repository.save(entity);
  }

  async updateStatus(
    id: string,
    updateLanguageStatusDto: UpdateStatusDto,
  ): Promise<LanguageEntity> {
    const language = await this.findOneByOrFail({
      where: { id },
    });

    language.isActive = updateLanguageStatusDto.isActive;

    return await this.repository.save(language);
  }

  async updateBulkStatus(
    updateLanguageStatusDto: UpdateStatusDto,
  ): Promise<void> {
    const result = await this.repository
      .createQueryBuilder()
      .update(LanguageEntity)
      .set({ isActive: updateLanguageStatusDto.isActive })
      .execute();

    if (!result.affected) {
      throw new NotFoundException(this.i18n.t('languages.notFound'));
    }
  }
  protected getNotFoundMessage(): string {
    return this.i18n.t('languages.notFound');
  }
}
