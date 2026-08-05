import { FindManyOptions, FindOneOptions, EntityManager } from 'typeorm';

export interface IFindOneBy<TEntity> {
  findOneBy(
    options: FindOneOptions<TEntity>,
    manager?: EntityManager,
  ): Promise<TEntity | null>;
  findOneByOrFail(
    options: FindOneOptions<TEntity>,
    manager?: EntityManager,
  ): Promise<TEntity>;
}

export interface IFindBy<TEntity> {
  findBy(options: FindManyOptions<TEntity>): Promise<TEntity[] | null>;
}
