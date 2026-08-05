import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { DocumentEntityTypeEnum } from 'src/libs/enums/document-entity-type.enum';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import { CreateServiceTypeOptionDto } from 'src/modules/category/dto/request/create-service-type-option.dto';
import { ServiceTypeOptionEntity } from 'src/modules/category/entities/service-type-option.entity';
import { ServiceTypeOptionService } from 'src/modules/category/service-type-option.service';
import { ServiceTypeService } from 'src/modules/category/service-type.service';
import { DocumentService } from 'src/modules/document/document.service';
import { EntityManager } from 'typeorm';

describe('ServiceTypeOptionService', () => {
  let service: ServiceTypeOptionService;

  const mockServiceTypeOptionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockTransactionalEntityManager = {
    save: jest.fn(),
  };

  const mockEntityManager = {
    transaction: jest.fn(),
  };

  const mockServiceTypeService = {
    findOneByOrFail: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  const mockDocumentService = {
    findOne: jest.fn(),
    markAsUsed: jest.fn(),
  };

  const createDto: CreateServiceTypeOptionDto = {
    serviceTypeId: '1',
    name: {
      ar: 'زيارة متعددة',
      en: 'Multi Visit',
    },
    description: {
      ar: 'وصف الفئة بالعربية',
      en: 'Category description in English',
    },
    logoId: '123',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceTypeOptionService,
        {
          provide: getRepositoryToken(ServiceTypeOptionEntity),
          useValue: mockServiceTypeOptionRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        {
          provide: ServiceTypeService,
          useValue: mockServiceTypeService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    service = module.get<ServiceTypeOptionService>(ServiceTypeOptionService);

    mockEntityManager.transaction.mockImplementation(
      async (
        callback: (
          manager: typeof mockTransactionalEntityManager,
        ) => Promise<unknown>,
      ) => callback(mockTransactionalEntityManager),
    );

    mockTransactionalEntityManager.save.mockImplementation(
      async (entity) => await entity,
    );
  });

  describe('create', () => {
    it('should create a service type option with a logo successfully', async () => {
      const entity = {
        id: 'entity-id',
        serviceTypeId: createDto.serviceTypeId,
        nameAr: createDto.name.ar,
        nameEn: createDto.name.en,
        descriptionAr: createDto.description?.ar,
        descriptionEn: createDto.description?.en,
        logoId: createDto.logoId,
        isActive: false,
      } as ServiceTypeOptionEntity;

      mockServiceTypeService.findOneByOrFail.mockResolvedValue({
        supportsOptions: true,
      });
      mockServiceTypeOptionRepository.findOne.mockResolvedValue(null);
      mockDocumentService.findOne.mockResolvedValue({
        id: createDto.logoId,
        status: DocumentStatusEnum.Pending,
        isUsed: false,
      });
      mockServiceTypeOptionRepository.create.mockReturnValue(entity);

      await service.create(createDto);

      expect(mockServiceTypeService.findOneByOrFail).toHaveBeenCalledWith({
        where: { id: createDto.serviceTypeId },
      });

      expect(mockServiceTypeOptionRepository.findOne).toHaveBeenCalledWith({
        where: [
          {
            nameAr: createDto.name.ar,
            serviceTypeId: createDto.serviceTypeId,
          },
          {
            nameEn: createDto.name.en,
            serviceTypeId: createDto.serviceTypeId,
          },
        ],
      });

      expect(mockDocumentService.findOne).toHaveBeenCalledWith(
        createDto.logoId,
      );

      expect(mockServiceTypeOptionRepository.create).toHaveBeenCalledWith({
        serviceTypeId: createDto.serviceTypeId,
        nameEn: createDto.name.en,
        nameAr: createDto.name.ar,
        descriptionEn: createDto.description?.en,
        descriptionAr: createDto.description?.ar,
        logoId: createDto.logoId,
      });

      expect(mockEntityManager.transaction).toHaveBeenCalledTimes(1);

      expect(mockDocumentService.markAsUsed).toHaveBeenCalledWith(
        [createDto.logoId],
        DocumentEntityTypeEnum.ServiceTypeOption,
        entity.id,
        mockTransactionalEntityManager,
        DocumentStatusEnum.Approved,
      );

      expect(mockTransactionalEntityManager.save).toHaveBeenCalledWith(entity);
      expect(mockServiceTypeOptionRepository.save).not.toHaveBeenCalled();
    });

    it('should create a service type option without a logo successfully', async () => {
      const dtoWithoutLogo: CreateServiceTypeOptionDto = {
        logoId: '',
        serviceTypeId: createDto.serviceTypeId,
        name: createDto.name,
        description: createDto.description,
      };

      const entity = {
        id: 'entity-id',
        serviceTypeId: dtoWithoutLogo.serviceTypeId,
        nameAr: dtoWithoutLogo.name.ar,
        nameEn: dtoWithoutLogo.name.en,
        descriptionAr: dtoWithoutLogo.description?.ar,
        descriptionEn: dtoWithoutLogo.description?.en,
      } as ServiceTypeOptionEntity;

      mockServiceTypeService.findOneByOrFail.mockResolvedValue({
        supportsOptions: true,
      });
      mockServiceTypeOptionRepository.findOne.mockResolvedValue(null);
      mockServiceTypeOptionRepository.create.mockReturnValue(entity);

      await service.create(dtoWithoutLogo);

      expect(mockDocumentService.findOne).not.toHaveBeenCalled();
      expect(mockDocumentService.markAsUsed).not.toHaveBeenCalled();
      expect(mockTransactionalEntityManager.save).toHaveBeenCalledWith(entity);
    });

    it('should throw UnprocessableEntityException when service type does not support options', async () => {
      mockServiceTypeService.findOneByOrFail.mockResolvedValue({
        supportsOptions: false,
      });

      await expect(service.create(createDto)).rejects.toThrow(
        UnprocessableEntityException,
      );

      expect(mockServiceTypeService.findOneByOrFail).toHaveBeenCalledWith({
        where: { id: createDto.serviceTypeId },
      });
      expect(mockServiceTypeOptionRepository.findOne).not.toHaveBeenCalled();
      expect(mockDocumentService.findOne).not.toHaveBeenCalled();
      expect(mockEntityManager.transaction).not.toHaveBeenCalled();
    });

    it('should propagate NotFoundException when service type does not exist', async () => {
      mockServiceTypeService.findOneByOrFail.mockRejectedValue(
        new NotFoundException('services-types.errors.notFound'),
      );

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockServiceTypeService.findOneByOrFail).toHaveBeenCalledWith({
        where: { id: createDto.serviceTypeId },
      });
      expect(mockServiceTypeOptionRepository.findOne).not.toHaveBeenCalled();
      expect(mockEntityManager.transaction).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when Arabic or English name already exists for the same service type', async () => {
      const existingServiceTypeOption = {
        id: '2',
        nameAr: createDto.name.ar,
        nameEn: createDto.name.en,
        serviceTypeId: createDto.serviceTypeId,
      } as ServiceTypeOptionEntity;

      mockServiceTypeService.findOneByOrFail.mockResolvedValue({
        supportsOptions: true,
      });
      mockServiceTypeOptionRepository.findOne.mockResolvedValue(
        existingServiceTypeOption,
      );

      await expect(service.create(createDto)).rejects.toThrow(
        UnprocessableEntityException,
      );

      expect(mockServiceTypeOptionRepository.findOne).toHaveBeenCalledWith({
        where: [
          {
            nameAr: createDto.name.ar,
            serviceTypeId: createDto.serviceTypeId,
          },
          {
            nameEn: createDto.name.en,
            serviceTypeId: createDto.serviceTypeId,
          },
        ],
      });
      expect(mockDocumentService.findOne).not.toHaveBeenCalled();
      expect(mockEntityManager.transaction).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when logo does not exist', async () => {
      mockServiceTypeService.findOneByOrFail.mockResolvedValue({
        supportsOptions: true,
      });
      mockServiceTypeOptionRepository.findOne.mockResolvedValue(null);
      mockDocumentService.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        'service-type-options.errors.logoNotFound',
      );

      expect(mockDocumentService.findOne).toHaveBeenCalledWith(
        createDto.logoId,
      );
      expect(mockServiceTypeOptionRepository.create).not.toHaveBeenCalled();
      expect(mockEntityManager.transaction).not.toHaveBeenCalled();
    });

    it.each([
      {
        caseName: 'logo status is not pending',
        logo: {
          status: DocumentStatusEnum.Approved,
          isUsed: false,
        },
      },
      {
        caseName: 'logo is already used',
        logo: {
          status: DocumentStatusEnum.Pending,
          isUsed: true,
        },
      },
    ])(
      'should throw UnprocessableEntityException when $caseName',
      async ({ logo }) => {
        mockServiceTypeService.findOneByOrFail.mockResolvedValue({
          supportsOptions: true,
        });
        mockServiceTypeOptionRepository.findOne.mockResolvedValue(null);
        mockDocumentService.findOne.mockResolvedValue({
          id: createDto.logoId,
          ...logo,
        });

        await expect(service.create(createDto)).rejects.toThrow(
          UnprocessableEntityException,
        );

        expect(mockServiceTypeOptionRepository.create).not.toHaveBeenCalled();
        expect(mockDocumentService.markAsUsed).not.toHaveBeenCalled();
        expect(mockEntityManager.transaction).not.toHaveBeenCalled();
      },
    );
  });

  describe('updateStatus', () => {
    it('should update service type option status successfully', async () => {
      const serviceTypeOption = {
        id: '1',
        isActive: false,
      } as ServiceTypeOptionEntity;

      mockServiceTypeOptionRepository.findOne.mockResolvedValue(
        serviceTypeOption,
      );
      mockServiceTypeOptionRepository.save.mockResolvedValue(
        serviceTypeOption,
      );

      await service.updateStatus('1', { isActive: true });

      expect(mockServiceTypeOptionRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(serviceTypeOption.isActive).toBe(true);
      expect(mockServiceTypeOptionRepository.save).toHaveBeenCalledWith(
        serviceTypeOption,
      );
    });

    it('should throw NotFoundException when service type option does not exist', async () => {
      mockServiceTypeOptionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus('1', { isActive: true }),
      ).rejects.toThrow('service-type-options.errors.notFound');

      expect(mockServiceTypeOptionRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockServiceTypeOptionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findOneBy', () => {
    it('should return a service type option', async () => {
      const serviceTypeOption = {
        id: '1',
      } as ServiceTypeOptionEntity;

      mockServiceTypeOptionRepository.findOne.mockResolvedValue(
        serviceTypeOption,
      );

      await expect(
        service.findOneBy({ where: { id: '1' } }),
      ).resolves.toBe(serviceTypeOption);
    });
  });

  describe('findOneByOrFail', () => {
    it('should return a service type option when it exists', async () => {
      const serviceTypeOption = {
        id: '1',
      } as ServiceTypeOptionEntity;

      mockServiceTypeOptionRepository.findOne.mockResolvedValue(
        serviceTypeOption,
      );

      await expect(
        service.findOneByOrFail({ where: { id: '1' } }),
      ).resolves.toBe(serviceTypeOption);
    });

    it('should throw NotFoundException when service type option does not exist', async () => {
      mockServiceTypeOptionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneByOrFail({ where: { id: '1' } }),
      ).rejects.toThrow('service-type-options.errors.notFound');
    });
  });
});
