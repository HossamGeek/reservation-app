import { BadRequestException, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { EntityManager, Repository } from 'typeorm';
import { DocumentEntityTypeEnum } from 'src/libs/enums/document-entity-type.enum';
import { ServiceTranslationMapper } from 'src/libs/mappers/service-translation.mapper';
import { DocumentService } from 'src/modules/document/document.service';
import { CategoryService } from 'src/modules/category/category.service';
import { CreateServiceDto } from 'src/modules/service/dto/request/create-service.dto';
import { ServiceTypeService } from 'src/modules/category/service-type.service';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { ServiceService } from 'src/modules/service/service.service';
import { ServiceEntity } from 'src/modules/service/entities/service.entity';

jest.mock('nestjs-paginate', () => ({
  paginate: jest.fn(),
}));

describe('ServicesService', () => {
  let service: ServiceService;
  const leftJoin = jest.fn().mockReturnThis();
  const where = jest.fn().mockReturnThis();
  const andWhere = jest.fn().mockReturnThis();
  let serviceRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let categoryService: { findOneOrFail: jest.Mock };
  let serviceTypeService: { findOneBy: jest.Mock };
  let documentService: { findOne: jest.Mock; markAsUsed: jest.Mock };
  let i18n: { t: jest.Mock };
  let transactionEntityManager: { save: jest.Mock };
  let entityManager: { transaction: jest.Mock };

  const createDto: CreateServiceDto = {
    categoryId: '1',
    serviceTypeId: '5',
    name: {
      ar: 'تنظيف منزلي',
      en: 'Home Cleaning',
    },
    description: {
      ar: 'خدمة تنظيف منزلي احترافية',
      en: 'Professional home cleaning service',
    },
  };

  beforeEach(() => {
    jest
      .spyOn(I18nContext, 'current')
      .mockReturnValue({ lang: 'en' } as unknown as I18nContext);

    serviceRepository = {
      findOne: jest.fn(),
      create: jest.fn((entity) => entity),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoin,
        where,
        andWhere,
      })),
    };
    categoryService = { findOneOrFail: jest.fn() };
    serviceTypeService = { findOneBy: jest.fn() };
    documentService = { findOne: jest.fn(), markAsUsed: jest.fn() };
    i18n = { t: jest.fn((key: string) => key) };
    transactionEntityManager = {
      save: jest.fn((_entity, value) => ({
        id: '10',
        createdAt: new Date(),
        ...value,
      })),
    };
    entityManager = {
      transaction: jest.fn((callback) => callback(transactionEntityManager)),
    };

    service = new ServiceService(
      serviceRepository as unknown as Repository<ServiceEntity>,
      categoryService as unknown as CategoryService,
      serviceTypeService as unknown as ServiceTypeService,
      documentService as unknown as DocumentService,
      i18n as unknown as I18nService,
      entityManager as unknown as EntityManager,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockSuccessfulCreateDependencies = () => {
    categoryService.findOneOrFail.mockResolvedValue({
      id: createDto.categoryId,
    });
    serviceTypeService.findOneBy.mockResolvedValue({
      id: createDto.serviceTypeId,
    });
    serviceRepository.findOne.mockResolvedValue(null);
  };

  it('should create service successfully in a transaction', async () => {
    mockSuccessfulCreateDependencies();

    await expect(service.create(createDto)).resolves.toBeUndefined();

    expect(entityManager.transaction).toHaveBeenCalledTimes(1);
    expect(transactionEntityManager.save).toHaveBeenCalledWith(
      ServiceEntity,
      expect.objectContaining({
        categoryId: createDto.categoryId,
        serviceTypeId: createDto.serviceTypeId,
        descriptionEn: createDto.description.en,
      }),
    );
  });

  it('should reuse findOneBy in create', async () => {
    mockSuccessfulCreateDependencies();

    await service.create(createDto);

    expect(categoryService.findOneOrFail).toHaveBeenCalledWith({
      where: { id: createDto.categoryId },
    });
    expect(serviceTypeService.findOneBy).toHaveBeenCalledWith({
      where: { id: createDto.serviceTypeId },
    });
  });

  it('should throw NotFoundException if category lookup fails', async () => {
    categoryService.findOneOrFail.mockRejectedValue(new NotFoundException());

    await expect(service.create(createDto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should throw NotFoundException if service type lookup fails', async () => {
    categoryService.findOneOrFail.mockResolvedValue({
      id: createDto.categoryId,
    });
    serviceTypeService.findOneBy.mockRejectedValue(new NotFoundException());

    await expect(service.create(createDto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should throw UnprocessableEntityException with name.ar when Arabic name exists', async () => {
    categoryService.findOneOrFail.mockResolvedValue({
      id: createDto.categoryId,
    });
    serviceTypeService.findOneBy.mockResolvedValue({
      id: createDto.serviceTypeId,
    });
    serviceRepository.findOne.mockResolvedValue({
      nameAr: createDto.name.ar,
      nameEn: 'Other',
    });

    await expect(service.create(createDto)).rejects.toMatchObject({
      response: {
        message: 'services.alreadyExists',
        fields: {
          'name.ar': 'services.alreadyExists',
        },
      },
    });
  });

  it('should throw UnprocessableEntityException with name.en when English name exists', async () => {
    categoryService.findOneOrFail.mockResolvedValue({
      id: createDto.categoryId,
    });
    serviceTypeService.findOneBy.mockResolvedValue({
      id: createDto.serviceTypeId,
    });
    serviceRepository.findOne.mockResolvedValue({
      nameAr: 'أخرى',
      nameEn: createDto.name.en,
    });

    await expect(service.create(createDto)).rejects.toMatchObject({
      response: {
        message: 'services.alreadyExists',
        fields: {
          'name.en': 'services.alreadyExists',
        },
      },
    });
  });

  it('should throw UnprocessableEntityException with both fields when both names exist', async () => {
    categoryService.findOneOrFail.mockResolvedValue({
      id: createDto.categoryId,
    });
    serviceTypeService.findOneBy.mockResolvedValue({
      id: createDto.serviceTypeId,
    });
    serviceRepository.findOne.mockResolvedValue({
      nameAr: createDto.name.ar,
      nameEn: createDto.name.en,
    });

    await expect(service.create(createDto)).rejects.toMatchObject({
      response: {
        message: 'services.alreadyExists',
        fields: {
          'name.ar': 'services.alreadyExists',
          'name.en': 'services.alreadyExists',
        },
      },
    });
  });

  it('should validate duplicates with one findOne query using toUniqueWhere', async () => {
    mockSuccessfulCreateDependencies();

    await service.create(createDto);

    expect(serviceRepository.findOne).toHaveBeenCalledTimes(1);
    expect(serviceRepository.findOne).toHaveBeenCalledWith({
      where: ServiceTranslationMapper.toUniqueWhere(createDto),
    });
  });

  it('should not pass isActive explicitly when creating service', async () => {
    mockSuccessfulCreateDependencies();

    await service.create(createDto);

    expect(serviceRepository.create).toHaveBeenCalledWith(
      expect.not.objectContaining({ isActive: expect.any(Boolean) }),
    );
  });

  it('should save logoId as null when logoId is missing', async () => {
    mockSuccessfulCreateDependencies();

    await service.create(createDto);

    expect(serviceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ logoId: null }),
    );
  });

  it('should call documentService.markAsUsed when logoId exists', async () => {
    mockSuccessfulCreateDependencies();
    const logoDocument = {
      id: '2',
      fileName: 'logo.png',
      status: DocumentStatusEnum.Pending,
    };
    documentService.findOne.mockResolvedValue(logoDocument);

    await service.create({ ...createDto, logoId: '2' });

    expect(serviceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ logoId: '2' }),
    );
    expect(serviceRepository.create).toHaveBeenCalledWith(
      expect.not.objectContaining({ logo: expect.anything() }),
    );
    expect(documentService.markAsUsed).toHaveBeenCalledWith(
      ['2'],
      DocumentEntityTypeEnum.Service,
      '10',
      transactionEntityManager,
      DocumentStatusEnum.Approved,
    );
  });

  it('should throw BadRequestException when logo document is not pending', async () => {
    mockSuccessfulCreateDependencies();
    documentService.findOne.mockResolvedValue({
      id: '2',
      status: DocumentStatusEnum.Approved,
    });

    await expect(
      service.create({ ...createDto, logoId: '2' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(entityManager.transaction).not.toHaveBeenCalled();
  });

  it('ServiceTranslationMapper.toEntity should include logoId', () => {
    expect(
      ServiceTranslationMapper.toEntity({ ...createDto, logoId: '2' }),
    ).toEqual(expect.objectContaining({ logoId: '2' }));
  });

  it('ServiceTranslationMapper.toEntity should include description translations', () => {
    expect(ServiceTranslationMapper.toEntity(createDto)).toEqual(
      expect.objectContaining({
        descriptionAr: createDto.description.ar,
        descriptionEn: createDto.description.en,
      }),
    );
  });

  it('should not call documentService.markAsUsed when logoId is missing', async () => {
    mockSuccessfulCreateDependencies();

    await service.create(createDto);
    expect(documentService.markAsUsed).not.toHaveBeenCalled();
  });

  it('should return localized Arabic response through mapper', () => {
    jest
      .spyOn(I18nContext, 'current')
      .mockReturnValue({ lang: 'ar' } as unknown as I18nContext);
    const entity = {
      id: '10',
      categoryId: '1',
      serviceTypeId: '5',
      nameAr: 'تنظيف منزلي',
      nameEn: 'Home Cleaning',
      descriptionAr: 'خدمة تنظيف منزلي احترافية',
      descriptionEn: 'Professional home cleaning service',
      isActive: false,
      logo: null,
      createdAt: new Date(),
    } as ServiceEntity;

    expect(ServiceTranslationMapper.toResponse(entity)).toEqual(
      expect.objectContaining({
        name: 'تنظيف منزلي',
        description: 'خدمة تنظيف منزلي احترافية',
      }),
    );
  });

  it('should return localized English response through mapper', () => {
    jest
      .spyOn(I18nContext, 'current')
      .mockReturnValue({ lang: 'en' } as unknown as I18nContext);
    const entity = {
      id: '10',
      categoryId: '1',
      serviceTypeId: '5',
      nameAr: 'تنظيف منزلي',
      nameEn: 'Home Cleaning',
      descriptionAr: 'خدمة تنظيف منزلي احترافية',
      descriptionEn: 'Professional home cleaning service',
      isActive: false,
      logo: null,
      createdAt: new Date(),
    } as ServiceEntity;

    expect(ServiceTranslationMapper.toResponse(entity)).toEqual(
      expect.objectContaining({
        name: 'Home Cleaning',
        description: 'Professional home cleaning service',
      }),
    );
  });

  it('should return services statistics and 0 total service requests', async () => {
    serviceRepository.count.mockResolvedValueOnce(2).mockResolvedValueOnce(1);

    const result = await service.getStatistics();

    expect(serviceRepository.count).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      totalServices: 3,
      activeServices: 2,
      inactiveServices: 1,
      totalServiceRequests: 0,
    });
  });

  describe('findAll', () => {
    it('should call paginate and return mapped list response', async () => {
      const query = { page: 1, limit: 10 } as unknown as PaginateQuery;

      const mockResult = {
        data: [
          {
            id: '1',
            nameEn: 'CleaningEn',
            nameAr: 'CleaningAr',
            isActive: true,
            logo: {
              fullUrl: () => 'http://logo-url',
            },
          },
        ],
        meta: { totalItems: 1 },
      };

      const mockPaginate = paginate as jest.Mock;
      mockPaginate.mockResolvedValue(mockResult);

      const result = await service.findAll(query);

      expect(mockPaginate).toHaveBeenCalled();
      expect(result.data).toEqual([
        expect.objectContaining({
          id: '1',
          name: 'CleaningEn',
          logo: 'http://logo-url',
          isActive: true,
        }),
      ]);
    });

    it('should apply mobile filters for active service, category, and service type', async () => {
      const query = { page: 1, limit: 10 } as unknown as PaginateQuery;
      const mockPaginate = paginate as jest.Mock;
      mockPaginate.mockResolvedValue({ data: [], meta: {} });

      await service.findAll(query, { isMobile: true });

      expect(leftJoin).toHaveBeenCalledWith('service.category', 'category');
      expect(leftJoin).toHaveBeenCalledWith(
        'service.serviceType',
        'serviceType',
      );
      expect(where).toHaveBeenCalledWith(
        'service.isActive = :isActive',
        { isActive: true },
      );
      expect(andWhere).toHaveBeenCalledWith(
        'category.isActive = :isActive',
        { isActive: true },
      );
      expect(andWhere).toHaveBeenCalledWith(
        'serviceType.isActive = :isActive',
        { isActive: true },
      );
      expect(mockPaginate).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find service by id and return detailed response', async () => {
      const mockService = {
        id: '1',
        nameEn: 'CleaningEn',
        nameAr: 'CleaningAr',
        descriptionEn: 'DescEn',
        descriptionAr: 'DescAr',
        isActive: true,
        category: { id: '2', nameEn: 'CatEn', nameAr: 'CatAr', isActive: true },
        serviceType: {
          id: '3',
          nameEn: 'TypeEn',
          nameAr: 'TypeAr',
          isActive: true,
          supportsOptions: true,
          options: [
            { id: '10', nameEn: 'OptEn', nameAr: 'OptAr', isActive: true },
          ],
        },
        logo: {
          fullUrl: () => 'http://logo-url',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      serviceRepository.findOne.mockResolvedValue(mockService);

      const result = await service.findOne('1');

      expect(serviceRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: {
          category: true,
          serviceType: {
            options: true,
          },
          logo: true,
        },
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'CleaningEn',
          description: 'DescEn',
          logoUrl: 'http://logo-url',
          category: { id: '2', name: 'CatEn', isActive: true },
          serviceType: {
            id: '3',
            name: 'TypeEn',
            isActive: true,
            supportsOptions: true,
            options: [{ id: '10', name: 'OptEn', isActive: true }],
          },
        }),
      );
    });

    it('should throw NotFoundException if service does not exist', async () => {
      serviceRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});
