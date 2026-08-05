import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CityService } from 'src/modules/city/city.service';
import { CityEntity } from 'src/modules/city/entities/city.entity';
import { CountryService } from 'src/modules/country/country.service';
import { paginate, PaginateQuery } from 'nestjs-paginate';

jest.mock('nestjs-paginate', () => ({
  ...jest.requireActual('nestjs-paginate'),
  paginate: jest.fn(),
}));

describe('CityService', () => {
  let service: CityService;

  const mockRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  const mockCountryService = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityService,
        {
          provide: getRepositoryToken(CityEntity),
          useValue: mockRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
        {
          provide: CountryService,
          useValue: mockCountryService,
        },
      ],
    }).compile();

    service = module.get(CityService);
    jest.clearAllMocks();
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  describe('findOneBy', () => {
    it('should return a city entity when found', async () => {
      const cityEntity = {
        id: '1',
        nameEn: 'Cairo',
        nameAr: 'القاهرة',
        countryId: '10',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as CityEntity;

      mockRepository.findOne.mockResolvedValue(cityEntity);

      const result = await service.findOneBy({ where: { id: '1' } });
      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if city does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneBy({ where: { id: '1' } });
      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update city activation status successfully', async () => {
      const cityEntity = {
        id: '1',
        nameEn: 'Cairo',
        nameAr: 'القاهرة',
        countryId: '10',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as CityEntity;

      mockRepository.findOne.mockResolvedValue(cityEntity);
      mockRepository.save.mockImplementation((city) => Promise.resolve(city));

      await service.updateStatus('1', true);

      expect(cityEntity.isActive).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(cityEntity);
    });

    it('should throw NotFoundException if city not found during update status', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateStatus('1', true)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create city successfully', async () => {
      const dto = {
        name: {
          en: 'New York',
          ar: 'نيويورك',
        },
        countryId: '1',
      };

      mockCountryService.findOneBy.mockResolvedValue({ id: '1' });
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.save.mockImplementation((city) => Promise.resolve(city));

      await service.create(dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: [
          { nameAr: dto.name.ar, countryId: dto.countryId },
          { nameEn: dto.name.en, countryId: dto.countryId },
        ],
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if city already exists in the same country', async () => {
      const dto = {
        name: {
          en: 'New York',
          ar: 'نيويورك',
        },
        countryId: '1',
      };

      const existingCity = {
        id: '1',
        nameEn: 'New York',
        nameAr: 'نيويورك',
        countryId: '1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as CityEntity;

      mockCountryService.findOneBy.mockResolvedValue({ id: '1' });
      mockRepository.findOne.mockResolvedValue(existingCity);

      await expect(service.create(dto)).rejects.toThrow(UnprocessableEntityException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if country does not exist', async () => {
      const dto = {
        name: {
          en: 'New York',
          ar: 'نيويورك',
        },
        countryId: '1',
      };

      mockCountryService.findOneBy.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getSaudiArabiaCities', () => {
    const query: PaginateQuery = {
      path: '/cities/saudi-arabia',
      page: 1,
      limit: 20,
    };

    const paginatedResult = {
      data: [{ id: '1', nameAr: 'الرياض', nameEn: 'Riyadh' }],
      meta: {},
      links: {},
    };

    beforeEach(() => {
      (paginate as jest.Mock).mockResolvedValue(paginatedResult);
    });

    it('should build Saudi Arabia cities query and return mapped paginated result', async () => {
      const result = await service.getSaudiArabiaCities(query);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('city');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith(
        'city.country',
        'country',
      );
      expect(result).toEqual(
        expect.objectContaining({
          ...paginatedResult,
          data: [expect.objectContaining({ id: '1', name: 'Riyadh' })],
        }),
      );
    });

    it('should filter by Saudi Arabia country code', async () => {
      await service.getSaudiArabiaCities(query);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'country.code = :countryCode',
        { countryCode: 'SA' },
      );
    });

    it('should filter active cities', async () => {
      await service.getSaudiArabiaCities(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'city.isActive = :isActive',
        { isActive: true },
      );
    });

    it('should select only required fields', async () => {
      await service.getSaudiArabiaCities(query);

      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        'city.id',
        'city.nameAr',
        'city.nameEn',
        "city.isActive"
      ]);
    });

    it('should apply default Arabic-name stable sorting through pagination config', async () => {
      await service.getSaudiArabiaCities(query);

      expect(paginate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.objectContaining({
          defaultSortBy: [
            ['isActive', 'DESC'],
            ['nameAr', 'ASC'],
          ],
        }),
      );
    });

    it('should support Arabic search', async () => {
      await service.getSaudiArabiaCities({ ...query, search: 'رياض' });

      expect(paginate).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'رياض' }),
        mockQueryBuilder,
        expect.objectContaining({ searchableColumns: ['nameEn', 'nameAr'] }),
      );
    });

    it('should support English search case-insensitively through pagination config', async () => {
      await service.getSaudiArabiaCities({ ...query, search: ' Riyadh ' });

      expect(paginate).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Riyadh' }),
        mockQueryBuilder,
        expect.objectContaining({ searchableColumns: ['nameEn', 'nameAr'] }),
      );
    });

    it('should return mapped empty pagination when no cities are found', async () => {
      (paginate as jest.Mock).mockResolvedValue({
        data: [],
        meta: { totalItems: 0, totalPages: 0 },
        links: {},
      });

      const result = await service.getSaudiArabiaCities(query);

      expect(result.data).toEqual([]);
      expect(result.meta.totalItems).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });
});
