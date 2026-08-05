import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PositionService } from 'src/modules/position/position.service';
import { PositionEntity } from 'src/modules/position/entities/position.entity';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { UpdatePositionDto } from 'src/modules/position/dto/request/update-position.dto';

// Mock nestjs-paginate
jest.mock('nestjs-paginate', () => ({
  paginate: jest.fn(),
}));

describe('PositionsService', () => {
  let service: PositionService;

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
        PositionService,
        {
          provide: getRepositoryToken(PositionEntity),
          useValue: mockRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    service = module.get(PositionService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a position successfully if names are unique', async () => {
      const dto = {
        name: {
          ar: 'سائق',
          en: 'Driver',
        },
      };

      const expectedEntity = {
        nameAr: 'سائق',
        nameEn: 'Driver',
        isActive: false,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(expectedEntity);
      mockRepository.save.mockResolvedValue(expectedEntity);

      await service.create(dto);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith({
        nameAr: 'سائق',
        nameEn: 'Driver',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedEntity);
    });

    it('should throw UnprocessableEntityException on duplicate creation', async () => {
      const dto = {
        name: {
          ar: 'سائق',
          en: 'Driver',
        },
      };

      const existingEntity = {
        id: '1',
        nameAr: 'سائق',
        nameEn: 'Driver',
        isActive: false,
      };

      mockRepository.findOne.mockResolvedValue(existingEntity);

      await expect(service.create(dto)).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of positions', async () => {
      const mockQuery: PaginateQuery = {
        path: 'http://localhost/positions',
      };

      const mockEntities = [
        {
          id: '1',
          nameAr: 'سائق',
          nameEn: 'Driver',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as PositionEntity[];

      const mockPaginateResult = {
        data: mockEntities,
        meta: {
          itemsPerPage: 20,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'http://localhost/positions?page=1&limit=20',
        },
      };

      (paginate as jest.Mock).mockResolvedValue(mockPaginateResult);

      const result = await service.findAll(mockQuery);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('1');
      expect(result.data[0].name).toBe('Driver');
      expect(paginate).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update position successfully', async () => {
      const entity = {
        id: '1',
        nameAr: 'سائق',
        nameEn: 'Driver',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as PositionEntity;

      const dto = {
        name: {
          ar: 'مربية أطفال',
          en: 'Nanny',
        },
      };

      mockRepository.findOne
        .mockResolvedValueOnce(entity)
        .mockResolvedValueOnce(null);
      mockRepository.save.mockImplementation((e) => Promise.resolve(e));

      await service.update('1', dto);

      expect(entity.nameAr).toBe('مربية أطفال');
      expect(entity.nameEn).toBe('Nanny');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(entity);
    });

    it('should throw UnprocessableEntityException on duplicate update', async () => {
      const entity = {
        id: '1',
        nameAr: 'سائق',
        nameEn: 'Driver',
        isActive: true,
      } as PositionEntity;

      const duplicateEntity = {
        id: '2',
        nameAr: 'مربية أطفال',
        nameEn: 'Nanny',
        isActive: true,
      } as PositionEntity;

      const dto = {
        name: {
          ar: 'مربية أطفال',
          en: 'Nanny',
        },
      };

      mockRepository.findOne
        .mockResolvedValueOnce(entity)
        .mockResolvedValueOnce(duplicateEntity);

      await expect(service.update('1', dto)).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException on duplicate update when only one translation is provided', async () => {
      const entity = {
        id: '1',
        nameAr: 'سائق',
        nameEn: 'Driver',
        isActive: true,
      } as PositionEntity;

      const duplicateEntity = {
        id: '2',
        nameAr: 'مربية أطفال',
        nameEn: 'Nanny',
        isActive: true,
      } as PositionEntity;

      const dto = {
        name: {
          ar: 'مربية أطفال',
        },
      };

      mockRepository.findOne
        .mockResolvedValueOnce(entity)
        .mockResolvedValueOnce(duplicateEntity);

      await expect(service.update('1', dto as unknown as UpdatePositionDto)).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw NotFoundException if position does not exist during update', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', { name: { ar: 'سائق', en: 'Driver' } })).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update status successfully', async () => {
      const entity = {
        id: '1',
        nameAr: 'سائق',
        nameEn: 'Driver',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as PositionEntity;

      mockRepository.findOne.mockResolvedValue(entity);
      mockRepository.save.mockImplementation((e) => Promise.resolve(e));

      await service.updateStatus('1', true);

      expect(entity.isActive).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(entity);
    });

    it('should throw NotFoundException if position does not exist during status update', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateStatus('1', true)).rejects.toThrow(NotFoundException);
    });
  });
});
