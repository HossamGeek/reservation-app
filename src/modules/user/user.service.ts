import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { getUsersPaginationConfig } from 'src/libs/pagination/users.pagination';
import { encodePassword } from 'src/libs/utils/bcrypt';
import { RoleService } from 'src/modules/role/role.service';
import { EntityManager, Repository } from 'typeorm';
import { CreateProviderOwnerDto } from '../provider/dto/request/create-provider-owner.dto';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { UserEntity } from './entities/user.entity';

import { BaseEntityService } from 'src/libs/base-service/base-entity.service';
import { UserMapper } from 'src/libs/mappers/user.mapper';
import { UpdateClientProfileDto } from '../client/dto/request/update-client-profile.dto';
import { UpdateProviderOwnerDto } from '../provider/dto/request/update-provider-owner.dto';

@Injectable()
export class UserService extends BaseEntityService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    repository: Repository<UserEntity>,
    private readonly roleService: RoleService,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async create(createUserDto: CreateUserDto) {
    const { roleId, ...userData } = createUserDto;

    await this.checkEmailAvailability(userData.email, userData.type);

    userData.password = userData.password
      ? await encodePassword(userData.password)
      : '';

    if (roleId) {
      await this.roleService.checkExistence(roleId);
    }

    const user = this.repository.create({
      roleId: roleId,
      ...userData,
    });

    await this.repository.insert(user);
  }

  async checkEmailAvailability(email: string, type: UserTypeEnum) {
    const isExist = await this.repository.existsBy({ email, type });

    if (isExist) {
      throw new UnprocessableEntityException({
        email: [`Email Already Exists`],
      });
    }
  }

  async findAll(query: PaginateQuery): Promise<Paginated<UserEntity>> {
    const queryBuilder = this.repository.createQueryBuilder('user');
    return paginate(query, queryBuilder, getUsersPaginationConfig);
  }

  async findOne(id: string): Promise<UserEntity> {
    return await this.findOneByOrFail({
      where: { id },
      relations: { role: true },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOneByOrFail({
      where: { id },
      relations: { role: true },
    });

    const { roleId, email, password } = updateUserDto;

    if (user.type !== UserTypeEnum.CLIENT && roleId && user.roleId != roleId) {
      const role = await this.roleService.findOneByOrFail({
        where: { id: roleId },
      });
      user.role = role;
    }

    if (email) {
      await this.checkEmailAvailability(email, user.type);
      user.email = email;
    }

    if (password) {
      user.password = await encodePassword(password);
    }

    return await this.repository.save(user);
  }

  async forceDelete(id: string): Promise<void> {
    const result = await this.repository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException("This user isn't found");
    }
  }

  async createProviderOwner(
    createProviderOwnerDto: CreateProviderOwnerDto,
    entityManager: EntityManager,
  ) {
    // check if email or phone exist for the same user type
    const existUser = await this.findOneBy({
      where: [
        {
          email: createProviderOwnerDto.email,
          type: UserTypeEnum.PROVIDER,
        },
        {
          phoneNumber: createProviderOwnerDto.phoneNumber,
          type: UserTypeEnum.PROVIDER,
        },
      ],
    });

    this.validateDuplicates(
      existUser,
      createProviderOwnerDto,
      UserMapper.duplicateFieldsMapping,
      'users.alreadyExists',
    );

    // Generate random password
    if (
      createProviderOwnerDto.password !== undefined &&
      createProviderOwnerDto.password !== null
    ) {
      createProviderOwnerDto.password = await encodePassword(
        createProviderOwnerDto.password,
      );
    }

    const user = new UserEntity();

    Object.assign(user, {
      type: UserTypeEnum.PROVIDER,
      ...createProviderOwnerDto,
    });

    return entityManager.save(user);
  }

  async updateProviderOwner(
    user: UserEntity,
    updateProviderOwnerDto: UpdateProviderOwnerDto,
  ) {
    Object.assign(user, updateProviderOwnerDto);

    return await this.repository.save(user);
  }
  protected getNotFoundMessage(): string {
    return "This user doesn't exist";
  }

  async updateClientProfile(
    user: UserEntity,
    dto: UpdateClientProfileDto,
    entityManager?: EntityManager,
  ): Promise<UserEntity> {
    UserMapper.toUpdateUser(dto, user);

    return entityManager
      ? entityManager.save(user)
      : this.repository.save(user);
  }
}
