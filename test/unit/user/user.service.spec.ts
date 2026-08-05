import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { EntityManager } from 'typeorm';
import { UserService } from 'src/modules/user/user.service';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { RoleService } from 'src/modules/role/role.service';
import { CreateProviderOwnerDto } from 'src/modules/provider/dto/request/create-provider-owner.dto';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';

describe('UserService', () => {
  let service: UserService;

  const mockRepository = {
    findOne: jest.fn(),
  };

  const mockRoleService = {
    checkExistence: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  const mockEntityManager = {
    save: jest.fn(),
  } as unknown as jest.Mocked<EntityManager>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository,
        },
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  describe('createProviderOwner', () => {
    const dto: CreateProviderOwnerDto = {
      email: 'test@example.com',
      phoneNumber: '+1234567890',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
    };

    it('should create a provider owner successfully if email and phone do not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const expectedUser = new UserEntity();
      Object.assign(expectedUser, {
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
      mockEntityManager.save.mockResolvedValue(expectedUser);

      const result = await service.createProviderOwner(dto, mockEntityManager);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: dto.email, type: UserTypeEnum.PROVIDER },
          { phoneNumber: dto.phoneNumber, type: UserTypeEnum.PROVIDER },
        ],
      });
      expect(mockEntityManager.save).toHaveBeenCalled();
      expect(result).toEqual(expectedUser);
    });

    it('should throw UnprocessableEntityException with email in fields if email already exists', async () => {
      const existingUser = {
        email: 'test@example.com',
        phoneNumber: '+9999999999',
      } as UserEntity;
      mockRepository.findOne.mockResolvedValue(existingUser);

      await expect(
        service.createProviderOwner(dto, mockEntityManager),
      ).rejects.toMatchObject({
        response: {
          message: ['users.alreadyExists'],
          fields: {
            email: 'users.alreadyExists',
          },
        },
      });

      expect(mockEntityManager.save).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException with phoneNumber in fields if phone already exists', async () => {
      const existingUser = {
        email: 'other@example.com',
        phoneNumber: '+1234567890',
      } as UserEntity;
      mockRepository.findOne.mockResolvedValue(existingUser);

      await expect(
        service.createProviderOwner(dto, mockEntityManager),
      ).rejects.toMatchObject({
        response: {
          message: ['users.alreadyExists'],
          fields: {
            phoneNumber: 'users.alreadyExists',
          },
        },
      });

      expect(mockEntityManager.save).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException with both fields if both email and phone already exist', async () => {
      const existingUser = {
        email: 'test@example.com',
        phoneNumber: '+1234567890',
      } as UserEntity;
      mockRepository.findOne.mockResolvedValue(existingUser);

      await expect(
        service.createProviderOwner(dto, mockEntityManager),
      ).rejects.toMatchObject({
        response: {
          message: ['users.alreadyExists'],
          fields: {
            email: 'users.alreadyExists',
            phoneNumber: 'users.alreadyExists',
          },
        },
      });

      expect(mockEntityManager.save).not.toHaveBeenCalled();
    });
  });
});
