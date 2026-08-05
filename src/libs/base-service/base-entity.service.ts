import { NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { IFindOneBy } from 'src/libs/interfaces/entity-reader.interface';
import {
  EntityManager,
  FindOneOptions,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { BaseDuplicateValidationService } from './base-duplicate-validation.service';

/**
 * Combines entity finder helpers with duplicate-field validation.
 * Use when a service needs both `findOneBy` / `findOneByOrFail` and `validateDuplicates`.
 */
export abstract class BaseEntityService<TEntity extends ObjectLiteral>
  extends BaseDuplicateValidationService
  implements IFindOneBy<TEntity>
{
  constructor(
    readonly repository: Repository<TEntity>,
    i18n: I18nService,
  ) {
    super(i18n);
  }

  protected resolveRepository(manager?: EntityManager): Repository<TEntity> {
    return manager
      ? manager.getRepository(this.repository.target)
      : this.repository;
  }

  async findOneBy(
    options: FindOneOptions<TEntity>,
    manager?: EntityManager,
  ): Promise<TEntity | null> {
    return this.resolveRepository(manager).findOne(options);
  }

  async findOneByOrFail(
    options: FindOneOptions<TEntity>,
    manager?: EntityManager,
  ): Promise<TEntity> {
    const entity = await this.findOneBy(options, manager);

    if (!entity) {
      throw new NotFoundException(this.getNotFoundMessage());
    }

    return entity;
  }

  protected abstract getNotFoundMessage(): string;
}
