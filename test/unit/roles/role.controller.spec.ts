import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { PaginateQuery } from 'nestjs-paginate';
import { ApiResponse } from 'src/libs/errors/api-response';
import { CreateRoleDto } from 'src/modules/role/dto/request/create-role.dto';
import { UpdateRoleDto } from 'src/modules/role/dto/request/update-role.dto';
import { RoleController } from 'src/modules/role/role.controller';
import { RoleService } from 'src/modules/role/role.service';

describe('RoleController', () => {
  let controller: RoleController;

  const mockRoleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    forceDelete: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
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

    controller = module.get(RoleController);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create role successfully', async () => {
      const dto = {
        name: 'Admin',
        permissions: {},
      } as CreateRoleDto;

      const role = {
        id: '1',
        ...dto,
      };

      mockRoleService.create.mockResolvedValue(role);

      const result = await controller.create(dto);

      expect(mockRoleService.create).toHaveBeenCalledWith(dto);

      expect(result).toEqual(
        ApiResponse.successResponse(
          'roles.create.success',
          {
            data: role,
          },
          201,
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated roles', async () => {
      const paginated = {
        data: [],
        meta: {},
        links: {},
      };

      mockRoleService.findAll.mockResolvedValue(paginated);

      const query: PaginateQuery = {
        path: '/roles',
      };
      const result = await controller.findAll(query);

      expect(mockRoleService.findAll).toHaveBeenCalledWith(query);

      expect(result).toEqual(
        ApiResponse.successResponse(
          'roles.getAll.success',
          {
            roles: paginated,
          },
          200,
        ),
      );
    });
  });

  describe('findOne', () => {
    it('should return one role', async () => {
      const role = {
        id: '1',
      };

      mockRoleService.findOne.mockResolvedValue(role);

      const result = await controller.findOne({ id: '1' });

      expect(mockRoleService.findOne).toHaveBeenCalledWith('1');

      expect(result).toEqual(
        ApiResponse.successResponse(
          'roles.getOne.success',
          {
            data: role,
          },
          200,
        ),
      );
    });
  });

  describe('update', () => {
    it('should update role', async () => {
      const dto = {
        name: 'Super Admin',
      } as UpdateRoleDto;

      const role = {
        id: '1',
        ...dto,
      };

      mockRoleService.update.mockResolvedValue(role);

      const result = await controller.update({ id: '1' }, dto);

      expect(mockRoleService.update).toHaveBeenCalledWith('1', dto);

      expect(result).toEqual(
        ApiResponse.successResponse(
          'roles.update.success',
          {
            data: role,
          },
          200,
        ),
      );
    });
  });

  describe('forceDelete', () => {
    it('should delete role', async () => {
      mockRoleService.forceDelete.mockResolvedValue(undefined);

      const result = await controller.forceDelete({ id: '1' });

      expect(mockRoleService.forceDelete).toHaveBeenCalledWith('1');

      expect(result).toEqual(
        ApiResponse.successResponse('roles.delete.success', {}, 200),
      );
    });
  });
});
