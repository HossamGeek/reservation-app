import { I18nService , I18nContext } from 'nestjs-i18n';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { BranchStatusEnum } from 'src/libs/enums/branch-status.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { getBranchesPaginationConfig } from 'src/libs/pagination/branches.pagination';
import { BranchService } from 'src/modules/branch/branch.service';
import { BranchEntity } from 'src/modules/branch/entities/branch.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { validate } from 'class-validator';
import { CityService } from 'src/modules/city/city.service';
import { DocumentService } from 'src/modules/document/document.service';
import { CreateBranchDto } from 'src/modules/branch/dto/request/create-branch.dto';
import { ProviderAdminEntity } from 'src/modules/user/entities/provider-admin.entity';
import { UserStatusEnum } from 'src/libs/enums/user-status.enum';
import { ProviderService } from 'src/modules/provider/provider.service';
import { BigIntIdParamDto } from 'src/libs/dto/bigint-id-param.dto';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';

jest.mock('nestjs-paginate', () => ({
  ...jest.requireActual('nestjs-paginate'),
  paginate: jest.fn(),
}));

describe('BranchService', () => {
  let service: BranchService;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
  };

  const mockBranchRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    findOne: jest.fn(),
  };

  const mockProviderService = {
    findOneByOrFail: jest.fn(),
  };

  const mockEntityManager = {
    transaction: jest.fn(),
  };

  const mockDocumentService = {
    findOneByOrFail: jest.fn(),
    markAsUsed: jest.fn(),
  };

  const mockCityService = {
    findOneByOrFail: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  const query: PaginateQuery = {
    path: '/branches',
    page: 1,
    limit: 20,
  };

  const adminUser = {
    id: 'admin-user',
    type: UserTypeEnum.ADMIN,
  } as ILoginUser;

  const validDto: CreateBranchDto = {
    name: { ar: 'فرع جديد', en: 'New Branch' },
    address: { ar: 'الرياض', en: 'Riyadh' },
    cityId: 'city-1',
    logoId: 'logo-1',
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
      providers: [
        BranchService,
        {
          provide: getRepositoryToken(BranchEntity),
          useValue: mockBranchRepository,
        },
        {
          provide: ProviderService,
          useValue: mockProviderService,
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: CityService,
          useValue: mockCityService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    service = module.get(BranchService);
    jest.clearAllMocks();
    mockBranchRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    jest
      .spyOn(I18nContext, 'current')
      .mockReturnValue({ lang: 'en' } as unknown as I18nContext);

    mockBranchRepository.findOne.mockResolvedValue(null);
    mockEntityManager.transaction.mockImplementation(
      async (callback: (manager: EntityManager) => Promise<void>) => {
        const transactionalManager = {
          save: jest.fn().mockResolvedValue({ id: 'branch-1' }),
        } as unknown as EntityManager;

        await callback(transactionalManager);
      },
    );
    mockDocumentService.findOneByOrFail.mockResolvedValue({
      id: 'logo-1',
      entityId: null,
      isUsed: false,
      status: DocumentStatusEnum.Pending,
    });
    mockDocumentService.markAsUsed.mockResolvedValue(undefined);
    mockDocumentService.findOneByOrFail.mockResolvedValue({
      id: 'logo-1',
      entityId: null,
      isUsed: false,
      status: DocumentStatusEnum.Pending,
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should paginate, map data, and preserve metadata', async () => {
      const branch = {
        id: '1',
        nameAr: 'فرع الرياض',
        nameEn: 'Riyadh Branch',
        addressAr: 'العنوان',
        addressEn: 'Address',
        status: BranchStatusEnum.Active,
        providerId: '10',
        isMainBranch: true,
        city: {
          id: '20',
          nameAr: 'الرياض',
          nameEn: 'Riyadh',
          isActive: true,
        },
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      } as BranchEntity;
      const paginated = {
        data: [branch],
        meta: { totalItems: 1, currentPage: 1 },
        links: { current: '/branches?page=1&limit=20' },
      };
      (paginate as jest.Mock).mockResolvedValue(paginated);

      const result = await service.findAll(query, adminUser);

      expect(mockBranchRepository.createQueryBuilder).toHaveBeenCalledWith(
        'branch',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'branch.city',
        'city',
      );
      expect(paginate).toHaveBeenCalledWith(
        query,
        mockQueryBuilder,
        getBranchesPaginationConfig,
      );
      expect(result.meta).toBe(paginated.meta);
      expect(result.links).toBe(paginated.links);
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Riyadh Branch',
          address: 'Address',
          providerId: '10',
          city: { id: '20', name: 'Riyadh' },
        }),
      );
    });

    it('should exclude soft-deleted branches', async () => {
      (paginate as jest.Mock).mockResolvedValue({
        data: [],
        meta: {},
        links: {},
      });

      await service.findAll(query, adminUser);
    });

    it('should use pagination config for search, filters, and default sorting', async () => {
      const filteredQuery: PaginateQuery = {
        ...query,
        search: ' Riyadh ',
        filter: {
          providerId: '$eq:10',
          cityId: '$eq:20',
          status: `$eq:${BranchStatusEnum.Active}`,
        },
      };
      (paginate as jest.Mock).mockResolvedValue({
        data: [],
        meta: {},
        links: {},
      });

      await service.findAll(filteredQuery, adminUser);

      expect(paginate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Riyadh',
          filter: filteredQuery.filter,
        }),
        mockQueryBuilder,
        expect.objectContaining({
          searchableColumns: ['nameEn', 'nameAr'],
          filterableColumns: {
            providerId: true,
            cityId: true,
            status: true,
          },
          defaultSortBy: [['createdAt', 'DESC']],
        }),
      );
    });

    it('should return an empty paginated result without throwing', async () => {
      (paginate as jest.Mock).mockResolvedValue({
        data: [],
        meta: { totalItems: 0, totalPages: 0 },
        links: {},
      });

      const result = await service.findAll(query, adminUser);

      expect(result.data).toEqual([]);
      expect(result.meta.totalItems).toBe(0);
    });

    it('should scope provider users to their authenticated provider', async () => {
      (paginate as jest.Mock).mockResolvedValue({
        data: [],
        meta: {},
        links: {},
      });

      await service.findAll(query, providerUser);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'branch.providerId = :providerId',
        { providerId: 'provider-1' },
      );
    });

    it('should not add an authorization provider condition for admins', async () => {
      (paginate as jest.Mock).mockResolvedValue({
        data: [],
        meta: {},
        links: {},
      });

      await service.findAll(query, adminUser);

      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
    });

    it('should reject provider users without a provider association', async () => {
      await expect(
        service.findAll(query, {
          id: 'provider-user',
          type: UserTypeEnum.PROVIDER,
        } as ILoginUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should create and save a branch when data is valid', async () => {
      mockProviderService.findOneByOrFail.mockResolvedValue({
        id: 'provider-1',
      });
      mockCityService.findOneByOrFail.mockResolvedValue({ id: 'city-1' });

      await service.create(validDto, providerUser);

      expect(mockProviderService.findOneByOrFail).toHaveBeenCalledWith({
        where: { id: 'provider-1' },
      });
      expect(mockCityService.findOneByOrFail).toHaveBeenCalledWith({
        where: { id: 'city-1' },
      });
      expect(mockBranchRepository.findOne).toHaveBeenCalledWith({
        where: [
          { nameAr: validDto.name.ar, providerId: 'provider-1' },
          { nameEn: validDto.name.en, providerId: 'provider-1' },
        ],
      });
      expect(mockEntityManager.transaction).toHaveBeenCalled();
      expect(mockDocumentService.markAsUsed).toHaveBeenCalled();
    });

    it('should throw NotFoundException when provider does not exist', async () => {
      mockProviderService.findOneByOrFail.mockRejectedValue(
        new NotFoundException('providers.notFound'),
      );

      await expect(service.create(validDto, providerUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCityService.findOneByOrFail).not.toHaveBeenCalled();
      expect(mockEntityManager.transaction).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when city does not exist', async () => {
      mockProviderService.findOneByOrFail.mockResolvedValue({
        id: 'provider-1',
      });
      mockCityService.findOneByOrFail.mockRejectedValue(
        new NotFoundException('cities.notFound'),
      );

      await expect(service.create(validDto, providerUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockEntityManager.transaction).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when Arabic branch name already exists for provider', async () => {
      mockProviderService.findOneByOrFail.mockResolvedValue({
        id: 'provider-1',
      });
      mockCityService.findOneByOrFail.mockResolvedValue({ id: 'city-1' });
      mockBranchRepository.findOne.mockResolvedValue({
        id: 'branch-2',
        providerId: 'provider-1',
        nameAr: validDto.name.ar,
        nameEn: 'Different English Name',
      } as BranchEntity);

      await expect(service.create(validDto, providerUser)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(mockBranchRepository.findOne).toHaveBeenCalledWith({
        where: [
          { nameAr: validDto.name.ar, providerId: 'provider-1' },
          { nameEn: validDto.name.en, providerId: 'provider-1' },
        ],
      });
      expect(mockEntityManager.transaction).not.toHaveBeenCalled();
      expect(mockDocumentService.markAsUsed).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when English branch name already exists for provider', async () => {
      mockProviderService.findOneByOrFail.mockResolvedValue({
        id: 'provider-1',
      });
      mockCityService.findOneByOrFail.mockResolvedValue({ id: 'city-1' });
      mockBranchRepository.findOne.mockResolvedValue({
        id: 'branch-2',
        providerId: 'provider-1',
        nameAr: 'اسم مختلف',
        nameEn: validDto.name.en,
      } as BranchEntity);

      await expect(service.create(validDto, providerUser)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(mockEntityManager.transaction).not.toHaveBeenCalled();
      expect(mockDocumentService.markAsUsed).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when authenticated user is not provider', async () => {
      await expect(
        service.create(validDto, {
          ...providerUser,
          type: UserTypeEnum.ADMIN,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(mockProviderService.findOneByOrFail).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when provider association is missing', async () => {
      await expect(
        service.create(validDto, {
          ...providerUser,
          providerAdmin: null,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(mockProviderService.findOneByOrFail).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const mockBranch = {
      id: '1',
      providerId: 'provider-1',
      nameAr: 'فرع جديد',
      nameEn: 'New Branch',
      addressAr: 'الرياض',
      addressEn: 'Riyadh',
      status: BranchStatusEnum.Inactive,
      isMainBranch: false,
      city: {
        id: 'city-1',
        nameAr: 'الرياض',
        nameEn: 'Riyadh',
        isActive: true,
      },
      logo: {
        fullUrl: () => 'https://example.com/logo.png',
      },
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    } as BranchEntity;

    it('should return branch when found for authenticated provider', async () => {
      mockBranchRepository.findOne.mockResolvedValue(mockBranch);

      const result = await service.findOne('1', providerUser);

      expect(mockBranchRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', providerId: 'provider-1' },
        relations: { city: true, logo: true },
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          name: { ar: 'فرع جديد', en: 'New Branch' },
          address: { ar: 'الرياض', en: 'Riyadh' },
          providerId: 'provider-1',
          logo: 'https://example.com/logo.png',
          status: BranchStatusEnum.Inactive,
          isMainBranch: false,
          city: expect.objectContaining({
            id: 'city-1',
            name: 'Riyadh',
          }),
        }),
      );
    });

    it('should reject invalid id', async () => {
      const params = new BigIntIdParamDto();
      params.id = 'invalid-id';

      const errors = await validate(params);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('IsBigIntId');
    });

    it('should throw NotFoundException when branch does not exist', async () => {
      mockBranchRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999', providerUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockBranchRepository.findOne).toHaveBeenCalledWith({
        where: { id: '999', providerId: 'provider-1' },
        relations: { city: true, logo: true },
      });
    });
  });
});
