import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { NationalityService } from 'src/modules/nationality/nationality.service';
import { NationalityEntity } from 'src/modules/nationality/entities/nationality.entity';
import { paginate, PaginateQuery } from 'nestjs-paginate';

// Mock nestjs-paginate
jest.mock('nestjs-paginate', () => ({
  paginate: jest.fn(),
}));

describe('NationalityService', () => {
  let service: NationalityService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
    })),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NationalityService,
        {
          provide: getRepositoryToken(NationalityEntity),
          useValue: mockRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    service = module.get(NationalityService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a nationality successfully', async () => {
      const dto = {
        name: {
          en: 'Jordanian',
          ar: 'أردني',
        },
      };

      const expectedEntity = {
        nameEn: 'Jordanian',
        nameAr: 'أردني',
        isActive: false,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue(expectedEntity);

      await service.create(dto);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalledWith(expectedEntity);
    });

    it('should throw UnprocessableEntityException on duplicate name', async () => {
      const dto = {
        name: {
          en: 'Jordanian',
          ar: 'أردني',
        },
      };

      const existingNationality = {
        id: '1',
        nameEn: 'Jordanian',
        nameAr: 'أردني',
        isActive: false,
      };

      mockRepository.findOne.mockResolvedValue(existingNationality);

      await expect(service.create(dto)).rejects.toThrow(
        UnprocessableEntityException,
      );

      expect(mockRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of nationalities', async () => {
      const mockQuery: PaginateQuery = {
        path: 'http://localhost/nationalities',
      };

      const mockEntities = [
        {
          id: '1',
          nameEn: 'Jordanian',
          nameAr: 'أردني',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as NationalityEntity[];

      const mockPaginateResult = {
        data: mockEntities,
        meta: {
          itemsPerPage: 20,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'http://localhost/nationalities?page=1&limit=20',
        },
      };

      (paginate as jest.Mock).mockResolvedValue(mockPaginateResult);

      const result = await service.findAll(mockQuery);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('1');
      expect(result.data[0].name).toBeDefined();
      expect(paginate).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update status successfully', async () => {
      const entity = {
        id: '1',
        nameEn: 'Jordanian',
        nameAr: 'أردني',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as NationalityEntity;

      mockRepository.findOne.mockResolvedValue(entity);
      mockRepository.save.mockImplementation((e) => Promise.resolve(e));

      await service.updateStatus('1', true);

      expect(entity.isActive).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(entity);
    });

    it('should throw NotFoundException if nationality does not exist during status update', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateStatus('1', true)).rejects.toThrow(NotFoundException);
    });
  });
});
