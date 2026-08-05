import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { BaseEntityFinderService } from 'src/libs/base-service/base-entity-finder.service';
import { ActionsEnum, Permissions } from 'src/libs/enums/permission.enum';
import { getRolesPaginationConfig } from 'src/libs/pagination/roles.pagination';
import { convertToObjectShape } from 'src/libs/transformers/permissions.transformer';
import { Not, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/request/create-role.dto';
import { UpdateRoleDto } from './dto/request/update-role.dto';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RoleService extends BaseEntityFinderService<RoleEntity> {
  constructor(
    @InjectRepository(RoleEntity)
    repository: Repository<RoleEntity>,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<RoleEntity>> {
    const queryBuilder = this.repository.createQueryBuilder('role');

    return await paginate(query, queryBuilder, getRolesPaginationConfig);
  }

  async findOne(id: string): Promise<RoleEntity | null> {
    const role = await this.findOneBy({ where: { id } });
    return role;
  }

  handlePermissions(permissions: Permissions): Permissions {
    for (const entity in permissions) {
      let view = false;
      for (const action in permissions[entity]) {
        view = view || permissions[entity][action];
      }
      permissions[entity][ActionsEnum.listView] = view;
    }
    return permissions;
  }

  // Function to convert from object shape to Permissions type

  async create(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    const { name } = createRoleDto;

    const sameNameRole = await this.repository.existsBy({ name });

    if (sameNameRole) {
      throw new UnprocessableEntityException(
        this.i18n.t('roles.alreadyExists'),
      );
    }

    const permission: Permissions = convertToObjectShape(
      createRoleDto.permissions,
    );
    const role = this.repository.create({
      ...createRoleDto,
      permissions: permission,
    });
    return await this.repository.save(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleEntity> {
    const role = await this.findOneBy({ where: { id } });
    if (!role) {
      throw new NotFoundException(this.i18n.t('roles.notFound'));
    }

    if (role.isSystemRole) {
      throw new UnprocessableEntityException(this.i18n.t('roles.systemRole'));
    }

    const { permissions, ...roleData } = updateRoleDto;

    if (roleData.name) {
      const existingRole = await this.repository.existsBy({
        name: roleData.name,
        id: Not(id.toString()),
      });
      if (existingRole) {
        throw new UnprocessableEntityException(
          this.i18n.t('roles.alreadyExists'),
        );
      }
    }

    if (permissions) {
      role.permissions = convertToObjectShape(permissions);
    }
    Object.assign(role, {
      ...roleData,
    });

    return await this.repository.save(role);
  }

  async checkExistence(id: string) {
    const isExist = await this.repository.existsBy({ id });
    if (!isExist) {
      throw new NotFoundException(this.i18n.t('roles.notFound'));
    }
  }

  async forceDelete(id: string): Promise<void> {
    const result = await this.repository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(this.i18n.t('roles.notFound'));
    }
  }
  protected getNotFoundMessage(): string {
    return this.i18n.t('roles.notFound');
  }
}
