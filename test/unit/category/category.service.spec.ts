import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginateQuery } from 'nestjs-paginate';
import { CategoryService } from 'src/modules/category/category.service';
import { CategoryEntity } from 'src/modules/category/entities/category.entity';
import { DocumentEntityTypeEnum } from 'src/libs/enums/document-entity-type.enum';
import { DocumentService } from 'src/modules/document/document.service';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import { EntityManager } from 'typeorm';
import { CreateCategoryDto } from 'src/modules/category/dto/request/create-category.dto';
import { UpdateCategoryDto } from 'src/modules/category/dto/request/update-category.dto';

// Mock nestjs-paginate to bypass actual SQL compilation
jest.mock('nestjs-paginate', () => ({
  paginate: jest.fn().mockResolvedValue({
    data: [],
    meta: {},
    links: {},
  }),
}));

describe('CategoryService', () => {
  let service: CategoryService;

  const mockTransactionalEntityManager = {
    save: jest.fn(),
  };

  const mockEntityManager = {
    transaction: jest.fn(
      async (
        callback: (
          manager: typeof mockTransactionalEntityManager,
        ) => Promise<void>,
      ) => callback(mockTransactionalEntityManager),
    ),
  };

  const mockDocumentService = {
    findOne: jest.fn(),
    markAsUsed: jest.fn(),
  };

  const mockCategoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softRemove: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
    })),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: mockCategoryRepository,
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
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    service = module.get(CategoryService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const dto = {
        name: {
          ar: 'طباخ',
          en: 'Cook',
        },
        description: {
          ar: 'وصف الفئة بالعربية',
          en: 'Category description in English',
        },
        logoId: '123',
      };

      const entity = {
        id: '1',
        nameAr: 'طباخ',
        nameEn: 'Cook',
        descriptionAr: 'وصف الفئة بالعربية',
        descriptionEn: 'Category description in English',
        logoId: '123',
        isActive: false,
      } as CategoryEntity;

      mockDocumentService.findOne.mockResolvedValue({
        id: '123',
        status: DocumentStatusEnum.Pending,
        isUsed: false,
      });
      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.create.mockReturnValue(entity);
      mockTransactionalEntityManager.save.mockResolvedValue(entity);

      await service.create(dto);

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: [{ nameAr: dto.name.ar }, { nameEn: dto.name.en }],
      });
      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        nameEn: dto.name.en,
        nameAr: dto.name.ar,
        descriptionEn: dto.description.en,
        descriptionAr: dto.description.ar,
        logoId: dto.logoId,
      });
      expect(mockDocumentService.findOne).toHaveBeenCalledWith(dto.logoId);
      expect(mockDocumentService.markAsUsed).toHaveBeenCalledWith(
        [dto.logoId],
        DocumentEntityTypeEnum.Category,
        entity.id,
        mockTransactionalEntityManager,
        DocumentStatusEnum.Approved,
      );
      expect(mockEntityManager.transaction).toHaveBeenCalled();
      expect(mockTransactionalEntityManager.save).toHaveBeenCalledWith(entity);
    });

    it('should throw UnprocessableEntityException if nameAr or nameEn exists', async () => {
      const dto = {
        name: {
          ar: 'طباخ',
          en: 'Cook',
        },
        description: {
          ar: 'وصف الفئة بالعربية',
          en: 'Category description in English',
        },
        logoId: '123',
      };
      const existingCategory = {
        id: '2',
        nameAr: 'طباخ',
        nameEn: 'Chef',
        isActive: true,
      } as CategoryEntity;

      mockCategoryRepository.findOne.mockResolvedValue(existingCategory);

      await expect(service.create(dto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(mockCategoryRepository.findOne).toHaveBeenCalled();
    });

    it('should create a category without logoId', async () => {
      const dto = {
        name: {
          ar: 'طباخ',
          en: 'Cook',
        },
        description: {
          ar: 'وصف الفئة بالعربية',
          en: 'Category description in English',
        },
      };

      const entity = {
        id: '1',
        nameAr: 'طباخ',
        nameEn: 'Cook',
        descriptionAr: 'وصف الفئة بالعربية',
        descriptionEn: 'Category description in English',
        isActive: false,
      } as CategoryEntity;

      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.create.mockReturnValue(entity);
      mockTransactionalEntityManager.save.mockResolvedValue(entity);

      await service.create(dto as CreateCategoryDto);

      expect(mockDocumentService.findOne).not.toHaveBeenCalled();
      expect(mockDocumentService.markAsUsed).not.toHaveBeenCalled();
      expect(mockEntityManager.transaction).toHaveBeenCalled();
      expect(mockTransactionalEntityManager.save).toHaveBeenCalledWith(entity);
    });
  });

  describe('findAll', () => {
    it('should return paginated categories', async () => {
      const query: PaginateQuery = { path: '/categories' };
      const result = await service.findAll(query);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });
  });

  describe('findOneBy', () => {
    it('should return a category when found', async () => {
      const category = {
        id: '1',
        nameAr: 'طباخ',
        nameEn: 'Cook',
        descriptionAr: 'وصف الفئة بالعربية',
        descriptionEn: 'Category description in English',
        logoId: '123',
      } as CategoryEntity;
      mockCategoryRepository.findOne.mockResolvedValue(category);

      const result = await service.findOneBy({ where: { id: '1' } });

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(category);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneOrFail({ where: { id: '1' } }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update category fields successfully', async () => {
      const existingCategory = {
        id: '1',
        nameAr: 'طباخ',
        nameEn: 'Cook',
        descriptionAr: 'old ar',
        descriptionEn: 'old en',
      } as CategoryEntity;
      const dto = {
        name: {
          ar: 'طباخ',
          en: 'Chef',
        },
        description: {
          ar: 'وصف جديد',
          en: 'New description',
        },
      };

      mockCategoryRepository.findOne
        .mockResolvedValueOnce(existingCategory)
        .mockResolvedValueOnce(null);
      mockTransactionalEntityManager.save.mockResolvedValue(existingCategory);

      await service.update('1', dto);

      expect(mockEntityManager.transaction).toHaveBeenCalled();
      expect(mockTransactionalEntityManager.save).toHaveBeenCalledWith(
        existingCategory,
      );
    });

    it('should validate and use logo when updating with logoId', async () => {
      const existingCategory = {
        id: '1',
        nameAr: 'طباخ',
        nameEn: 'Cook',
        descriptionAr: 'old ar',
        descriptionEn: 'old en',
      } as CategoryEntity;
      const dto = {
        logoId: '123',
      };

      mockCategoryRepository.findOne.mockResolvedValueOnce(existingCategory);
      mockDocumentService.findOne.mockResolvedValue({
        id: '123',
        status: DocumentStatusEnum.Pending,
        isUsed: false,
      });
      mockTransactionalEntityManager.save.mockResolvedValue(existingCategory);

      await service.update('1', dto as UpdateCategoryDto);

      expect(mockDocumentService.findOne).toHaveBeenCalledWith('123');
      expect(mockDocumentService.markAsUsed).toHaveBeenCalledWith(
        ['123'],
        DocumentEntityTypeEnum.Category,
        existingCategory.id,
        mockTransactionalEntityManager,
        DocumentStatusEnum.Approved,
      );
      expect(mockEntityManager.transaction).toHaveBeenCalled();
      expect(mockTransactionalEntityManager.save).toHaveBeenCalledWith(
        existingCategory,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update category isActive status successfully', async () => {
      const category = { id: '1', isActive: false } as CategoryEntity;
      mockCategoryRepository.findOne.mockResolvedValue(category);
      mockCategoryRepository.save.mockImplementation((cat) =>
        Promise.resolve(cat),
      );

      await service.updateStatus('1', { isActive: true });

      expect(category.isActive).toBe(true);
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(category);
    });
  });

  describe('remove', () => {
    it('should remove a category successfully', async () => {
      const category = { id: '1' } as CategoryEntity;
      mockCategoryRepository.findOne.mockResolvedValue(category);
      mockCategoryRepository.remove.mockResolvedValue(category);

      await service.remove('1');

      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(category);
    });
  });
});
