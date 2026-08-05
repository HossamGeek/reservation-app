import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ReligionService } from 'src/modules/religion/religion.service';
import { ReligionEntity } from 'src/modules/religion/entities/religion.entity';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { UpdateReligionDto } from 'src/modules/religion/dto/request/update-religion.dto';

// Mock nestjs-paginate
jest.mock('nestjs-paginate', () => ({
  paginate: jest.fn(),
}));

describe('ReligionsService', () => {
  let service: ReligionService;

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
        ReligionService,
        {
          provide: getRepositoryToken(ReligionEntity),
          useValue: mockRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    service = module.get(ReligionService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a religion successfully', async () => {
      const dto = {
        name: {
          ar: 'مسلم',
          en: 'Muslim',
        },
      };

      const expectedEntity = {
        nameAr: 'مسلم',
        nameEn: 'Muslim',
        isActive: false,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(expectedEntity);
      mockRepository.save.mockResolvedValue(expectedEntity);

      await service.create(dto);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(expectedEntity);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedEntity);
    });

    it('should throw UnprocessableEntityException on duplicate creation', async () => {
      const dto = {
        name: {
          ar: 'مسلم',
          en: 'Muslim',
        },
      };

      const existingEntity = {
        id: '1',
        nameAr: 'مسلم',
        nameEn: 'Muslim',
        isActive: false,
      };

      mockRepository.findOne.mockResolvedValue(existingEntity);

      await expect(service.create(dto)).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of religions', async () => {
      const mockQuery: PaginateQuery = {
        path: 'http://localhost/religions',
      };

      const mockEntities = [
        {
          id: '1',
          nameAr: 'مسلم',
          nameEn: 'Muslim',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as ReligionEntity[];

      const mockPaginateResult = {
        data: mockEntities,
        meta: {
          itemsPerPage: 20,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'http://localhost/religions?page=1&limit=20',
        },
      };

      (paginate as jest.Mock).mockResolvedValue(mockPaginateResult);

      const result = await service.findAll(mockQuery);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('1');
      expect(result.data[0].name).toBe('Muslim');
      expect(paginate).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update religion successfully', async () => {
      const entity = {
        id: '1',
        nameAr: 'مسلم',
        nameEn: 'Muslim',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ReligionEntity;

      const dto = {
        name: {
          ar: 'مسيحي',
          en: 'Christian',
        },
      };

      mockRepository.findOne
        .mockResolvedValueOnce(entity)
        .mockResolvedValueOnce(null);
      mockRepository.save.mockImplementation((e) => Promise.resolve(e));

      await service.update('1', dto);

      expect(entity.nameAr).toBe('مسيحي');
      expect(entity.nameEn).toBe('Christian');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(entity);
    });

    it('should throw UnprocessableEntityException on duplicate update', async () => {
      const entity = {
        id: '1',
        nameAr: 'مسلم',
        nameEn: 'Muslim',
        isActive: true,
      } as ReligionEntity;

      const duplicateEntity = {
        id: '2',
        nameAr: 'مسيحي',
        nameEn: 'Christian',
        isActive: true,
      } as ReligionEntity;

      const dto = {
        name: {
          ar: 'مسيحي',
          en: 'Christian',
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
        nameAr: 'مسلم',
        nameEn: 'Muslim',
        isActive: true,
      } as ReligionEntity;

      const duplicateEntity = {
        id: '2',
        nameAr: 'مسيحي',
        nameEn: 'Christian',
        isActive: true,
      } as ReligionEntity;

      const dto = {
        name: {
          ar: 'مسيحي',
        },
      };

      mockRepository.findOne
        .mockResolvedValueOnce(entity)
        .mockResolvedValueOnce(duplicateEntity);

      await expect(
        service.update('1', dto as unknown as UpdateReligionDto),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw NotFoundException if religion does not exist during update', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', { name: { ar: 'مسلم', en: 'Muslim' } })).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update status successfully', async () => {
      const entity = {
        id: '1',
        nameAr: 'مسلم',
        nameEn: 'Muslim',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ReligionEntity;

      mockRepository.findOne.mockResolvedValue(entity);
      mockRepository.save.mockImplementation((e) => Promise.resolve(e));

      await service.updateStatus('1', true);

      expect(entity.isActive).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(entity);
    });

    it('should throw NotFoundException if religion does not exist during status update', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateStatus('1', true)).rejects.toThrow(NotFoundException);
    });
  });
});
