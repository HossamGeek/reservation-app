import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { RoleService } from 'src/modules/role/role.service';
import { RoleEntity } from 'src/modules/role/entities/role.entity';
import { CreateRoleDto } from 'src/modules/role/dto/request/create-role.dto';
import { UpdateRoleDto } from 'src/modules/role/dto/request/update-role.dto';
import { Permissions } from 'src/libs/enums/permission.enum';

describe('RoleService', () => {
  let service: RoleService;

  const mockRepository = {
    createQueryBuilder: jest.fn(),

    findOne: jest.fn(),

    existsBy: jest.fn(),

    create: jest.fn(),

    save: jest.fn(),

    delete: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: mockRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    service = module.get(RoleService);

    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return role', async () => {
      const role = {
        id: '1',
      };

      mockRepository.findOne.mockResolvedValue(role);

      const result = await service.findOne('1');

      expect(result).toEqual(role);
    });

    it('should throw if role does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneBy', () => {
    it('should call repository.findOne', async () => {
      const role = {
        id: '1',
      };

      mockRepository.findOne.mockResolvedValue(role);

      const result = await service.findOneBy({
        where: {
          id: '1',
        },
      });

      expect(result).toEqual(role);
    });
  });

  describe('create', () => {
    it('should create role', async () => {
      const dto = {
        name: 'Admin',
        permissions: {},
      } as CreateRoleDto;

      mockRepository.existsBy.mockResolvedValue(false);

      mockRepository.create.mockImplementation((x) => x);

      mockRepository.save.mockImplementation((x) => ({
        id: '1',
        ...x,
      }));

      const result = await service.create(dto);

      expect(mockRepository.existsBy).toHaveBeenCalled();

      expect(mockRepository.save).toHaveBeenCalled();

      expect(result.id).toBe('1');
    });

    it('should throw if role already exists', async () => {
      mockRepository.existsBy.mockResolvedValue(true);

      await expect(
        service.create({
          name: 'Admin',
          permissions: {},
        } as CreateRoleDto),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('update', () => {
    it('should update role', async () => {
      const role = {
        id: '1',
        isSystemRole: false,
        permissions: {},
      } as RoleEntity;

      jest.spyOn(service, 'findOneBy').mockResolvedValue(role);

      mockRepository.existsBy.mockResolvedValue(false);

      mockRepository.save.mockResolvedValue({
        ...role,
        name: 'Updated',
      });

      const result = await service.update('1', {
        name: 'Updated',
      } as UpdateRoleDto);

      expect(mockRepository.save).toHaveBeenCalled();

      expect(result.name).toBe('Updated');
    });

    it('should throw if role does not exist', async () => {
      jest.spyOn(service, 'findOneBy').mockResolvedValue(null);

      await expect(service.update('1', {} as UpdateRoleDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw for system role', async () => {
      jest.spyOn(service, 'findOneBy').mockResolvedValue({
        id: '1',
        isSystemRole: true,
      } as RoleEntity);

      await expect(service.update('1', {} as UpdateRoleDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw when duplicate name exists', async () => {
      jest.spyOn(service, 'findOneBy').mockResolvedValue({
        id: '1',
        isSystemRole: false,
        permissions: {},
      } as RoleEntity);

      mockRepository.existsBy.mockResolvedValue(true);

      await expect(
        service.update('1', {
          name: 'Admin',
        } as UpdateRoleDto),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('checkExistence', () => {
    it('should pass if role exists', async () => {
      mockRepository.existsBy.mockResolvedValue(true);

      await expect(service.checkExistence('1')).resolves.toBeUndefined();
    });

    it('should throw if role does not exist', async () => {
      mockRepository.existsBy.mockResolvedValue(false);

      await expect(service.checkExistence('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('forceDelete', () => {
    it('should delete successfully', async () => {
      mockRepository.delete.mockResolvedValue({
        affected: 1,
      });

      await expect(service.forceDelete('1')).resolves.toBeUndefined();
    });

    it('should throw when role does not exist', async () => {
      mockRepository.delete.mockResolvedValue({
        affected: 0,
      });

      await expect(service.forceDelete('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('handlePermissions', () => {
    it('should set listView based on other permissions', () => {
      const permissions = {
        roles: {
          create: true,
          update: false,
          delete: false,
          detailedView: false,
          listView: false,
        },
      } as Permissions;

      const result = service.handlePermissions(permissions);

      expect(result.roles.listView).toBe(true);
    });
  });
});
