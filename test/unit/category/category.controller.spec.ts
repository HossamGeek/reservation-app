import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { PaginateQuery } from 'nestjs-paginate';
import { ApiResponse } from 'src/libs/errors/api-response';
import { CategoryController } from 'src/modules/category/category.controller';
import { CategoryService } from 'src/modules/category/category.service';
import { CreateCategoryDto } from 'src/modules/category/dto/request/create-category.dto';
import { UpdateCategoryDto } from 'src/modules/category/dto/request/update-category.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';

describe('CategoryController', () => {
  let controller: CategoryController;

  const mockCategoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    controller = module.get(CategoryController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create category successfully', async () => {
      const dto: CreateCategoryDto = {
        name: {
          ar: 'طباخ',
          en: 'Cook',
        },
      };

      mockCategoryService.create.mockResolvedValue(undefined);

      const result = await controller.create(dto);

      expect(mockCategoryService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(
        ApiResponse.successResponse('categories.create.success', {}, 201),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated categories', async () => {
      const paginatedResult = {
        data: [{ id: '1', nameAr: 'طباخ', nameEn: 'Cook', isActive: true }],
        meta: {},
        links: {},
      };

      mockCategoryService.findAll.mockResolvedValue(paginatedResult);

      const query: PaginateQuery = {
        path: '/categories',
      };
      const result = await controller.findAll(query);

      expect(mockCategoryService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(
        ApiResponse.successResponse('categories.getAll.success', {
          data: paginatedResult,
        }),
      );
    });
  });

  describe('update', () => {
    it('should update category details successfully', async () => {
      const dto: UpdateCategoryDto = {
        name: {
          ar: 'طباخ',
          en: 'Chef',
        },
      };

      mockCategoryService.update.mockResolvedValue(undefined);

      const result = await controller.update({ id: '1' }, dto);

      expect(mockCategoryService.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(
        ApiResponse.successResponse('categories.update.success', {}),
      );
    });
  });

  describe('updateStatus', () => {
    it('should update category status successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: true,
      };

      mockCategoryService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: '1' }, dto);

      expect(mockCategoryService.updateStatus).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(
        ApiResponse.successResponse('categories.update.success', {}),
      );
    });
  });

  describe('remove', () => {
    it('should soft-delete category successfully', async () => {
      mockCategoryService.remove.mockResolvedValue(undefined);

      const result = await controller.remove({ id: '1' });

      expect(mockCategoryService.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual(
        ApiResponse.successResponse('categories.delete.success'),
      );
    });
  });
});
