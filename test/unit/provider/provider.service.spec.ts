import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ProviderService } from 'src/modules/provider/provider.service';
import { ProviderEntity } from 'src/modules/provider/entities/provider.entity';
import { DocumentService } from 'src/modules/document/document.service';
import { UserService } from 'src/modules/user/user.service';
import { BranchService } from 'src/modules/branch/branch.service';
import { I18nService } from 'nestjs-i18n';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { ProviderStatusEnum } from 'src/libs/enums/provider-status.enum';
import { CityService } from 'src/modules/city/city.service';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { UpdateProviderDto } from 'src/modules/provider/dto/request/update-provider.dto';

// Mock nestjs-paginate
jest.mock('nestjs-paginate', () => ({
  paginate: jest.fn(),
}));

describe('ProviderService', () => {
  let service: ProviderService;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  const mockDocumentService = {
    findExistingIds: jest.fn(),
    findBy: jest.fn(),
    markAsUsed: jest.fn(),
    unassignDocuments: jest.fn(),
  };

  const mockTransactionManager = {
    save: jest.fn(),
  };

  const mockEntityManager = {
    transaction: jest.fn(
      async (
        callback: (manager: typeof mockTransactionManager) => Promise<unknown>,
      ) => callback(mockTransactionManager),
    ),
  };

  const mockUserService = {
    createProviderOwner: jest.fn(),
    updateProviderOwner: jest.fn(),
  };

  const mockBranchService = {
    createMainBranch: jest.fn(),
    updateBranch: jest.fn(),
  };

  const mockCityService = {
    findOneBy: jest.fn(),
    findOneByOrFail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderService,
        {
          provide: getRepositoryToken(ProviderEntity),
          useValue: mockRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: BranchService,
          useValue: mockBranchService,
        },
        {
          provide: CityService,
          useValue: mockCityService,
        },
      ],
    }).compile();

    service = module.get(ProviderService);
    jest.clearAllMocks();
  });

  describe('findAllJoinRequests', () => {
    it('should return a paginated list of non-approved provider join requests', async () => {
      const mockQuery: PaginateQuery = {
        path: 'http://localhost/providers/join-requests',
      };

      const mockEntities = [
        {
          id: '1',
          nameAr: 'مقدم خدمة',
          nameEn: 'Service Provider',
          status: ProviderStatusEnum.UnderReview,
          createdAt: new Date(),
          updatedAt: new Date(),
          branches: [
            {
              isMainBranch: true,
              city: {
                id: 'city-1',
                nameAr: 'الرياض',
                nameEn: 'Riyadh',
                isActive: true,
              },
            },
          ],
          logo: {
            id: 'logo-1',
            createdAt: new Date(),
            rejectionReason: null,
            status: 'Approved',
            fullUrl: () => 'http://localhost:5505/uploads/logo',
          },
        },
      ] as ProviderEntity[];

      const mockPaginateResult = {
        data: mockEntities,
        meta: {
          itemsPerPage: 20,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'http://localhost/providers/join-requests?page=1&limit=20',
        },
      };

      (paginate as jest.Mock).mockResolvedValue(mockPaginateResult);

      const result = await service.findAllJoinRequests(mockQuery);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('1');
      expect(result.data[0].name).toBe('Service Provider');
      expect(result.data[0].status).toBe(ProviderStatusEnum.UnderReview);
      expect(result.data[0].city).toEqual({
        id: 'city-1',
        name: 'Riyadh',
        isActive: true,
      });
      expect(result.data[0].logo).toBe('http://localhost:5505/uploads/logo');
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'provider',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenNthCalledWith(
        1,
        'provider.logo',
        'logo',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenNthCalledWith(
        2,
        'provider.branches',
        'branch',
        'branch.isMainBranch = true',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenNthCalledWith(
        3,
        'branch.city',
        'city',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'provider.status IN (:...statuses)',
        {
          statuses: [
            ProviderStatusEnum.UnderReview,
            ProviderStatusEnum.Rejected,
          ],
        },
      );
      expect(paginate).toHaveBeenCalled();
    });
  });

  describe('updateApplicationStatus', () => {
    const mockUser = { id: 'user-123' } as unknown as ILoginUser;

    it('should successfully approve a provider when all required documents are approved', async () => {
      const mockDoc = { id: 'doc-1', status: 'Approved' };
      const mockProvider = {
        id: '1',
        status: ProviderStatusEnum.UnderReview,
        logo: mockDoc,
        commercialRegistrationDocument: mockDoc,
        recruitmentLicenseDocument: mockDoc,
        nationalAddressProofDocument: mockDoc,
        ibanCertificateDocument: mockDoc,
        vatCertificateDocument: null,
      } as unknown as ProviderEntity;

      mockRepository.findOne.mockResolvedValue(mockProvider);

      const dto = {
        status: ProviderStatusEnum.Approved,
        rejectionReason: null,
      };
      await service.updateApplicationStatus('1', dto, mockUser);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockProvider.status).toBe(ProviderStatusEnum.Approved);
      expect(mockProvider.rejectionReason).toBeNull();
      expect(mockProvider.reviewedById).toBe('user-123');
      expect(mockRepository.save).toHaveBeenCalledWith(mockProvider);
    });

    it('should throw UnprocessableEntityException when at least one required document is Pending', async () => {
      const mockDocApproved = { id: 'doc-1', status: 'Approved' };
      const mockDocPending = { id: 'doc-2', status: 'Pending' };
      const mockProvider = {
        id: '1',
        status: ProviderStatusEnum.UnderReview,
        logo: mockDocApproved,
        commercialRegistrationDocument: mockDocApproved,
        recruitmentLicenseDocument: mockDocPending,
        nationalAddressProofDocument: mockDocApproved,
        ibanCertificateDocument: mockDocApproved,
        vatCertificateDocument: null,
      } as unknown as ProviderEntity;

      mockRepository.findOne.mockResolvedValue(mockProvider);

      const dto = {
        status: ProviderStatusEnum.Approved,
        rejectionReason: null,
      };
      await expect(
        service.updateApplicationStatus('1', dto, mockUser),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException when at least one required document is Rejected', async () => {
      const mockDocApproved = { id: 'doc-1', status: 'Approved' };
      const mockDocRejected = { id: 'doc-2', status: 'Rejected' };
      const mockProvider = {
        id: '1',
        status: ProviderStatusEnum.UnderReview,
        logo: mockDocApproved,
        commercialRegistrationDocument: mockDocApproved,
        recruitmentLicenseDocument: mockDocApproved,
        nationalAddressProofDocument: mockDocRejected,
        ibanCertificateDocument: mockDocApproved,
        vatCertificateDocument: null,
      } as unknown as ProviderEntity;

      mockRepository.findOne.mockResolvedValue(mockProvider);

      const dto = {
        status: ProviderStatusEnum.Approved,
        rejectionReason: null,
      };
      await expect(
        service.updateApplicationStatus('1', dto, mockUser),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should successfully reject a provider', async () => {
      const mockProvider = {
        id: '1',
        status: ProviderStatusEnum.UnderReview,
        rejectionReason: null,
      } as unknown as ProviderEntity;

      mockRepository.findOne.mockResolvedValue(mockProvider);

      const dto = {
        status: ProviderStatusEnum.Rejected,
        rejectionReason: 'Not valid details',
      };
      await service.updateApplicationStatus('1', dto, mockUser);

      expect(mockProvider.status).toBe(ProviderStatusEnum.Rejected);
      expect(mockProvider.rejectionReason).toBe('Not valid details');
      expect(mockProvider.reviewedById).toBe('user-123');
      expect(mockRepository.save).toHaveBeenCalledWith(mockProvider);
    });

    it('should throw NotFoundException when provider does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const dto = {
        status: ProviderStatusEnum.Approved,
        rejectionReason: null,
      };
      await expect(
        service.updateApplicationStatus('999', dto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const ownerUser = {
      id: 'provider-owner',
      type: UserTypeEnum.PROVIDER,
      providerAdmin: { providerId: 'provider-1' },
    } as unknown as ILoginUser;

    it('should update provider details and related records successfully', async () => {
      const provider = {
        id: 'provider-1',
        nameAr: 'Old Arabic Name',
        nameEn: 'Old English Name',
        branches: [{ id: 'branch-1', isMainBranch: true }],
        admins: [{ user: { id: 'provider-owner' } }],
      } as unknown as ProviderEntity;

      const savedProvider = {
        ...provider,
        id: 'provider-1',
      } as ProviderEntity;

      mockRepository.findOne
        .mockResolvedValueOnce(provider)
        .mockResolvedValueOnce(null);
      mockCityService.findOneByOrFail.mockResolvedValue({ id: 'city-1' });
      mockTransactionManager.save.mockResolvedValue(savedProvider);

      const updateDto = {
        name: { ar: 'New Arabic Name', en: 'New English Name' },
        address: { ar: 'New address', en: 'New address' },
        cityId: 'city-1',
        owner: { firstName: 'New', lastName: 'Owner' },
        documents: {},
      } as UpdateProviderDto;

      const result = await service.update(updateDto, ownerUser);

      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockCityService.findOneByOrFail).toHaveBeenCalledWith({
        where: { id: 'city-1' },
      });
      expect(mockUserService.createProviderOwner).not.toHaveBeenCalled();
      expect(mockUserService.updateProviderOwner).toHaveBeenCalledWith(
        provider.admins[0].user,
        updateDto.owner,
      );
      expect(mockBranchService.updateBranch).toHaveBeenCalledWith(
        provider.branches[0],
        {
          name: updateDto.name,
          address: updateDto.address,
          cityId: updateDto.cityId,
        },
        mockTransactionManager,
      );
      expect(mockTransactionManager.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException when the user has no provider admin context', async () => {
      const updateDto = {
        name: { ar: 'New Arabic Name', en: 'New English Name' },
      } as UpdateProviderDto;

      await expect(
        service.update(updateDto, {
          id: 'other-user',
          type: UserTypeEnum.PROVIDER,
        } as ILoginUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnprocessableEntityException when the updated name already exists', async () => {
      const provider = {
        id: 'provider-1',
        branches: [{ id: 'branch-1', isMainBranch: true }],
        admins: [{ user: { id: 'provider-owner' } }],
      } as unknown as ProviderEntity;

      const existingProvider = {
        id: 'provider-2',
        nameAr: 'New Arabic Name',
        nameEn: 'New English Name',
      } as unknown as ProviderEntity;

      mockRepository.findOne
        .mockResolvedValueOnce(provider)
        .mockResolvedValueOnce(existingProvider);

      const updateDto = {
        name: { ar: 'New Arabic Name', en: 'New English Name' },
      } as UpdateProviderDto;

      await expect(service.update(updateDto, ownerUser)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw UnprocessableEntityException when update documents contain duplicate ids', async () => {
      const provider = {
        id: 'provider-1',
        branches: [{ id: 'branch-1', isMainBranch: true }],
        admins: [{ user: { id: 'provider-owner' } }],
      } as unknown as ProviderEntity;

      mockRepository.findOne
        .mockResolvedValueOnce(provider)
        .mockResolvedValueOnce(null);

      const updateDto = {
        documents: {
          logoId: 'doc-1',
          recruitmentLicenseDocumentId: 'doc-1',
        },
      } as unknown as UpdateProviderDto;

      await expect(service.update(updateDto, ownerUser)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(mockDocumentService.findBy).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when any supplied replacement document does not exist', async () => {
      const provider = {
        id: 'provider-1',
        branches: [{ id: 'branch-1', isMainBranch: true }],
        admins: [{ user: { id: 'provider-owner' } }],
      } as unknown as ProviderEntity;

      mockRepository.findOne
        .mockResolvedValueOnce(provider)
        .mockResolvedValueOnce(null);
      mockDocumentService.findBy.mockResolvedValueOnce([]);

      const updateDto = {
        documents: {
          logoId: 'new-logo',
        },
      } as unknown as UpdateProviderDto;

      await expect(service.update(updateDto, ownerUser)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw UnprocessableEntityException when a supplied replacement document is already assigned', async () => {
      const provider = {
        id: 'provider-1',
        branches: [{ id: 'branch-1', isMainBranch: true }],
        admins: [{ user: { id: 'provider-owner' } }],
      } as unknown as ProviderEntity;

      mockRepository.findOne
        .mockResolvedValueOnce(provider)
        .mockResolvedValueOnce(null);
      mockDocumentService.findBy.mockResolvedValue([
        {
          id: 'new-logo',
          entityId: 'provider-2',
          isUsed: true,
          status: 'Pending',
        },
      ]);

      const updateDto = {
        documents: {
          logoId: 'new-logo',
        },
      } as unknown as UpdateProviderDto;

      await expect(service.update(updateDto, ownerUser)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw UnprocessableEntityException when a supplied replacement document is already used', async () => {
      const provider = {
        id: 'provider-1',
        branches: [{ id: 'branch-1', isMainBranch: true }],
        admins: [{ user: { id: 'provider-owner' } }],
      } as unknown as ProviderEntity;

      mockRepository.findOne
        .mockResolvedValueOnce(provider)
        .mockResolvedValueOnce(null);
      mockDocumentService.findBy.mockResolvedValue([
        {
          id: 'new-logo',
          entityId: null,
          isUsed: true,
          status: 'Pending',
        },
      ]);

      const updateDto = {
        documents: {
          logoId: 'new-logo',
        },
      } as unknown as UpdateProviderDto;

      await expect(service.update(updateDto, ownerUser)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw UnprocessableEntityException when a supplied replacement document is not pending', async () => {
      const provider = {
        id: 'provider-1',
        branches: [{ id: 'branch-1', isMainBranch: true }],
        admins: [{ user: { id: 'provider-owner' } }],
      } as unknown as ProviderEntity;

      mockRepository.findOne
        .mockResolvedValueOnce(provider)
        .mockResolvedValueOnce(null);
      mockDocumentService.findBy.mockResolvedValue([
        {
          id: 'new-logo',
          entityId: null,
          isUsed: false,
          status: 'Approved',
        },
      ]);

      const updateDto = {
        documents: {
          logoId: 'new-logo',
        },
      } as unknown as UpdateProviderDto;

      await expect(service.update(updateDto, ownerUser)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw UnprocessableEntityException when replacing a target document that is not replaceable', async () => {
      const provider = {
        id: 'provider-1',
        logoId: 'old-logo',
        branches: [{ id: 'branch-1', isMainBranch: true }],
        admins: [{ user: { id: 'provider-owner' } }],
      } as unknown as ProviderEntity;

      mockRepository.findOne
        .mockResolvedValueOnce(provider)
        .mockResolvedValueOnce(null);
      mockDocumentService.findBy.mockResolvedValue([
        {
          id: 'new-logo',
          entityId: null,
          isUsed: false,
          status: 'Pending',
        },
        {
          id: 'old-logo',
          status: 'Approved',
        },
      ]);

      const updateDto = {
        documents: {
          logoId: 'new-logo',
        },
      } as unknown as UpdateProviderDto;

      await expect(service.update(updateDto, ownerUser)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw UnprocessableEntityException when not all rejected target documents are replaced together', async () => {
      const provider = {
        id: 'provider-1',
        logoId: 'old-logo',
        vatCertificateDocumentId: 'old-vat',
        branches: [{ id: 'branch-1', isMainBranch: true }],
        admins: [{ user: { id: 'provider-owner' } }],
      } as unknown as ProviderEntity;

      mockRepository.findOne
        .mockResolvedValueOnce(provider)
        .mockResolvedValueOnce(null);
      mockDocumentService.findBy.mockResolvedValue([
        {
          id: 'old-logo',
          status: 'Rejected',
        },
        {
          id: 'old-vat',
          status: 'Rejected',
        },
      ]);

      const updateDto = {
        documents: {
          logoId: 'new-logo',
        },
      } as unknown as UpdateProviderDto;

      await expect(service.update(updateDto, ownerUser)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(mockDocumentService.findBy).toHaveBeenCalledTimes(1);
    });

    it('should update provider when all rejected target documents are replaced together', async () => {
      const provider = {
        id: 'provider-1',
        logoId: 'old-logo',
        vatCertificateDocumentId: 'old-vat',
        branches: [{ id: 'branch-1', isMainBranch: true }],
        admins: [{ user: { id: 'provider-owner' } }],
      } as unknown as ProviderEntity;

      const savedProvider = {
        ...provider,
        logoId: 'new-logo',
        vatCertificateDocumentId: 'new-vat',
      } as ProviderEntity;

      mockRepository.findOne
        .mockResolvedValueOnce(provider)
        .mockResolvedValueOnce(null);
      mockDocumentService.findBy.mockResolvedValue([
        {
          id: 'old-logo',
          status: 'Rejected',
        },
        {
          id: 'old-vat',
          status: 'Rejected',
        },
        {
          id: 'new-logo',
          entityId: null,
          isUsed: false,
          status: 'Pending',
        },
        {
          id: 'new-vat',
          entityId: null,
          isUsed: false,
          status: 'Pending',
        },
      ]);
      mockTransactionManager.save.mockResolvedValue(savedProvider);

      const updateDto = {
        documents: {
          logoId: 'new-logo',
          vatCertificateDocumentId: 'new-vat',
        },
      } as unknown as UpdateProviderDto;

      const result = await service.update(updateDto, ownerUser);

      expect(result).toBeDefined();
      expect(mockDocumentService.unassignDocuments).toHaveBeenCalledWith(
        ['old-logo', 'old-vat'],
        mockTransactionManager,
      );
      expect(mockDocumentService.markAsUsed).toHaveBeenCalledWith(
        ['new-logo', 'new-vat'],
        expect.anything(),
        'provider-1',
        mockTransactionManager,
      );
    });
  });

  describe('findProviderDocuments', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');

    const createDocument = (
      overrides: Record<string, unknown> = {},
    ): Record<string, unknown> => ({
      id: 'doc-1',
      createdAt,
      updatedAt,
      originalFileName: 'file.pdf',
      rejectionReason: null,
      status: 'Approved',
      verifiedBy: null,
      fullUrl: () => 'http://localhost:5505/public/file.pdf',
      ...overrides,
    });

    const documentRelations = {
      admins: {
        user: true,
      },
      logo: {
        verifiedBy: true,
      },
      commercialRegistrationDocument: {
        verifiedBy: true,
      },
      recruitmentLicenseDocument: {
        verifiedBy: true,
      },
      nationalAddressProofDocument: {
        verifiedBy: true,
      },
      ibanCertificateDocument: {
        verifiedBy: true,
      },
      vatCertificateDocument: {
        verifiedBy: true,
      },
    };

    it('should return mapped provider documents and load document relations', async () => {
      const logo = createDocument({
        id: 'logo-1',
        originalFileName: 'logo.png',
        fullUrl: () => 'http://localhost:5505/public/logo.png',
        verifiedBy: { firstName: 'Jane', lastName: 'Doe' },
      });
      const commercialRegistrationDocument = createDocument({
        id: 'cr-1',
        originalFileName: 'cr.pdf',
      });
      const recruitmentLicenseDocument = createDocument({ id: 'rl-1' });
      const nationalAddressProofDocument = createDocument({ id: 'nap-1' });
      const ibanCertificateDocument = createDocument({ id: 'iban-1' });
      const vatCertificateDocument = createDocument({ id: 'vat-1' });

      const provider = {
        id: 'provider-1',
        admins: [{ user: { id: 'provider-owner' } }],
        logo,
        commercialRegistrationDocument,
        recruitmentLicenseDocument,
        nationalAddressProofDocument,
        ibanCertificateDocument,
        vatCertificateDocument,
      } as unknown as ProviderEntity;

      mockRepository.findOne.mockResolvedValue(provider);

      const result = await service.findProviderDocuments('provider-1', {
        id: 'admin-1',
        type: UserTypeEnum.ADMIN,
      } as ILoginUser);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'provider-1' },
        relations: documentRelations,
      });
      expect(result).toHaveLength(6);
      expect(result[0]).toEqual({
        id: 'logo-1',
        createdAt,
        fullUrl: 'http://localhost:5505/public/logo.png',
        originalFileName: 'logo.png',
        rejectionReason: null,
        status: 'Approved',
        verifiedBy: 'Jane Doe',
        updatedAt,
      });
      expect(result[1].id).toBe('cr-1');
      expect(result[1].verifiedBy).toBeNull();
    });

    it('should allow the provider owner to fetch documents', async () => {
      const provider = {
        id: 'provider-1',
        admins: [
          {
            user: {
              type: UserTypeEnum.PROVIDER,
              providerAdmin: { providerId: 'provider-1' },
            },
          },
        ],
        logo: createDocument({ id: 'logo-1' }),
        commercialRegistrationDocument: createDocument({ id: 'cr-1' }),
        recruitmentLicenseDocument: null,
        nationalAddressProofDocument: null,
        ibanCertificateDocument: null,
        vatCertificateDocument: null,
      } as unknown as ProviderEntity;

      mockRepository.findOne.mockResolvedValue(provider);

      const result = await service.findProviderDocuments('provider-1', {
        type: UserTypeEnum.PROVIDER,
        providerAdmin: { providerId: 'provider-1' },
      } as ILoginUser);

      expect(result).toHaveLength(2);
      expect(result.map((document) => document.id)).toEqual(['logo-1', 'cr-1']);
    });

    it('should return an empty list when all document relations are null', async () => {
      const provider = {
        id: 'provider-1',
        admins: [{ user: { id: 'provider-owner' } }],
        logo: null,
        commercialRegistrationDocument: null,
        recruitmentLicenseDocument: null,
        nationalAddressProofDocument: null,
        ibanCertificateDocument: null,
        vatCertificateDocument: null,
      } as unknown as ProviderEntity;

      mockRepository.findOne.mockResolvedValue(provider);

      const result = await service.findProviderDocuments('provider-1', {
        id: 'admin-1',
        type: UserTypeEnum.ADMIN,
      } as ILoginUser);

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when a provider user is not the owner', async () => {
      const provider = {
        id: 'provider-1',
        admins: [{ user: { id: 'provider-owner' } }],
        logo: null,
        commercialRegistrationDocument: null,
        recruitmentLicenseDocument: null,
        nationalAddressProofDocument: null,
        ibanCertificateDocument: null,
        vatCertificateDocument: null,
      } as unknown as ProviderEntity;

      mockRepository.findOne.mockResolvedValue(provider);

      await expect(
        service.findProviderDocuments('provider-1', {
          id: 'other-user',
          type: UserTypeEnum.PROVIDER,
        } as ILoginUser),
      ).rejects.toThrow(NotFoundException);
      expect(mockI18n.t).toHaveBeenCalledWith('auth.errors.notAuthorized');
    });

    it('should throw NotFoundException when provider does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findProviderDocuments('999', {
          id: 'admin-1',
          type: UserTypeEnum.ADMIN,
        } as ILoginUser),
      ).rejects.toThrow(NotFoundException);
      expect(mockI18n.t).toHaveBeenCalledWith('providers.notFound');
    });
  });
});
