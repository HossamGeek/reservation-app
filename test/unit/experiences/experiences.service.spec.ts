import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ExperienceService } from 'src/modules/experience/experience.service';
import { ExperienceEntity } from 'src/modules/experience/entities/experience.entity';
import { paginate, PaginateQuery } from 'nestjs-paginate';

// Mock nestjs-paginate
jest.mock('nestjs-paginate', () => ({
  paginate: jest.fn(),
}));

describe('ExperiencesService', () => {
  let service: ExperienceService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getExists: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperienceService,
        {
          provide: getRepositoryToken(ExperienceEntity),
          useValue: mockRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    service = module.get(ExperienceService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an experience range successfully if valid', async () => {
      const dto = {
        minYears: 2,
        maxYears: 5,
      };

      const expectedEntity = {
        minYears: 2,
        maxYears: 5,
        isActive: false,
      };

      mockQueryBuilder.getExists.mockResolvedValue(false); // No overlap
      mockRepository.create.mockReturnValue(expectedEntity);
      mockRepository.save.mockResolvedValue(expectedEntity);

      await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(expectedEntity);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedEntity);
    });

    it('should throw UnprocessableEntityException if maxYears <= minYears', async () => {
      const dto = {
        minYears: 5,
        maxYears: 3,
      };

      await expect(service.create(dto)).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if range overlaps with existing range', async () => {
      const dto = {
        minYears: 2,
        maxYears: 5,
      };

      mockQueryBuilder.getExists.mockResolvedValue(true); // Overlap found

      await expect(service.create(dto)).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of experiences', async () => {
      const mockQuery: PaginateQuery = {
        path: 'http://localhost/experiences',
      };

      const mockEntities = [
        {
          id: '1',
          minYears: 1,
          maxYears: 3,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as ExperienceEntity[];

      const mockPaginateResult = {
        data: mockEntities,
        meta: {
          itemsPerPage: 20,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'http://localhost/experiences?page=1&limit=20',
        },
      };

      (paginate as jest.Mock).mockResolvedValue(mockPaginateResult);

      const result = await service.findAll(mockQuery);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('1');
      expect(result.data[0].minYears).toBe(1);
      expect(result.data[0].maxYears).toBe(3);
      expect(paginate).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update experience successfully', async () => {
      const entity = {
        id: '1',
        minYears: 1,
        maxYears: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ExperienceEntity;

      const dto = {
        minYears: 2,
        maxYears: 4,
      };

      mockRepository.findOne.mockResolvedValue(entity);
      mockQueryBuilder.getExists.mockResolvedValue(false); // No overlap
      mockRepository.save.mockImplementation((e) => Promise.resolve(e));

      await service.update('1', dto);

      expect(entity.minYears).toBe(2);
      expect(entity.maxYears).toBe(4);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(entity);
    });

    it('should throw NotFoundException if experience does not exist during update', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', { minYears: 2 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update status successfully', async () => {
      const entity = {
        id: '1',
        minYears: 1,
        maxYears: 3,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ExperienceEntity;

      mockRepository.findOne.mockResolvedValue(entity);
      mockRepository.save.mockImplementation((e) => Promise.resolve(e));

      await service.updateStatus('1', true);

      expect(entity.isActive).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(entity);
    });

    it('should throw NotFoundException if experience does not exist during status update', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateStatus('1', true)).rejects.toThrow(NotFoundException);
    });
  });
});
