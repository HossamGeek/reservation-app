import { NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { IFindOneBy } from 'src/libs/interfaces/entity-reader.interface';
import {
  EntityManager,
  FindOneOptions,
  ObjectLiteral,
  Repository,
} from 'typeorm';

export abstract class BaseEntityFinderService<
  TEntity extends ObjectLiteral,
> implements IFindOneBy<TEntity> {
  constructor(
    readonly repository: Repository<TEntity>,
    protected readonly i18n: I18nService,
  ) {}

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
