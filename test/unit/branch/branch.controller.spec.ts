import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { PaginateQuery } from 'nestjs-paginate';
import { ApiResponse } from 'src/libs/errors/api-response';
import { BranchController } from 'src/modules/branch/branch.controller';
import { BranchService } from 'src/modules/branch/branch.service';
import { CreateBranchDto } from 'src/modules/branch/dto/request/create-branch.dto';
import { UserStatusEnum } from 'src/libs/enums/user-status.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { ProviderAdminEntity } from 'src/modules/user/entities/provider-admin.entity';

describe('BranchController', () => {
  let controller: BranchController;

  const mockBranchService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  const providerUser: ILoginUser = {
    id: 'user-1',
    email: 'provider@example.com',
    phoneNumber: '+966500000000',
    type: UserTypeEnum.PROVIDER,
    status: UserStatusEnum.ACTIVE,
    providerAdmin: {
      providerId: 'provider-1',
    } as ProviderAdminEntity,
    role: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BranchController],
      providers: [
        { provide: BranchService, useValue: mockBranchService },
        { provide: I18nService, useValue: mockI18n },
        {
          provide: BranchService,
          useValue: mockBranchService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    controller = module.get(BranchController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated branches', async () => {
      const paginated = {
        data: [],
        meta: { itemsPerPage: 20, totalItems: 0 },
        links: {},
      };
      const query: PaginateQuery = { path: '/branches', page: 1, limit: 20 };
      const user = { id: 'admin', type: UserTypeEnum.ADMIN } as ILoginUser;

      mockBranchService.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(query, user);

      expect(mockBranchService.findAll).toHaveBeenCalledWith(query, user);
      expect(result).toEqual(
        ApiResponse.successResponse('branches.getAll.success', {
          branches: paginated,
        }),
      );
    });
  }); 

  describe('create', () => {
    it('should create branch successfully', async () => {
      const dto: CreateBranchDto = {
        name: { ar: 'فرع جديد', en: 'New Branch' },
        address: { ar: 'الرياض', en: 'Riyadh' },
        cityId: 'city-1',
        logoId: 'logo-1',
      };

      mockBranchService.create.mockResolvedValue(undefined);

      const result = await controller.create(dto, providerUser);

      expect(mockBranchService.create).toHaveBeenCalledWith(dto, providerUser);
      expect(result).toEqual(
        ApiResponse.successResponse('branches.create.success', {}, 201),
      );
    });
  });

  describe('findOne', () => {
    it('should return branch successfully', async () => {
      const branch = {
        id: '1',
        name: 'New Branch',
        address: 'Riyadh',
        status: 'inactive',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBranchService.findOne.mockResolvedValue(branch);

      const result = await controller.findOne({ id: '1' }, providerUser);

      expect(mockBranchService.findOne).toHaveBeenCalledWith('1', providerUser);
      expect(result).toEqual(
        ApiResponse.successResponse('branches.getOne.success', {
          data: branch,
        }),
      );
    });
  });
});
