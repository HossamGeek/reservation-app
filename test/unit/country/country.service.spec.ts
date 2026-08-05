import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CountryService } from 'src/modules/country/country.service';
import { CountryEntity } from 'src/modules/country/entities/country.entity';
import { paginate, PaginateQuery } from 'nestjs-paginate';

// Mock nestjs-paginate
jest.mock('nestjs-paginate', () => ({
  paginate: jest.fn(),
}));

describe('CountryService', () => {
  let service: CountryService;

  const mockRepository = {
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
    })),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        {
          provide: getRepositoryToken(CountryEntity),
          useValue: mockRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    service = module.get(CountryService);
    jest.clearAllMocks();
  });

  describe('updateStatus', () => {
    it('should update country activation status successfully', async () => {
      const countryEntity = {
        id: '1',
        nameEn: 'Jordan',
        nameAr: 'الأردن',
        isActive: false,
      } as CountryEntity;

      mockRepository.findOne.mockResolvedValue(countryEntity);
      mockRepository.save.mockImplementation((country) => Promise.resolve(country));

      await service.updateStatus('1', true);

      expect(countryEntity.isActive).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(countryEntity);
    });

    it('should throw NotFoundException if country not found during update status', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateStatus('1', true)).rejects.toThrow(NotFoundException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findWithCities', () => {
    it('should return a paginated list of countries with mapped cities', async () => {
      const mockQuery: PaginateQuery = {
        path: 'http://localhost/countries/with-cities',
      };

      const mockCountryEntities = [
        {
          id: '1',
          nameEn: 'Jordan',
          nameAr: 'الأردن',
          code: 'JO',
          isActive: true,
          cities: [
            {
              id: '10',
              nameEn: 'Amman',
              nameAr: 'عمان',
              isActive: true,
              countryId: '1',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockPaginateResult = {
        data: mockCountryEntities,
        meta: {
          itemsPerPage: 20,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'http://localhost/countries/with-cities?page=1&limit=20',
        },
      };

      (paginate as jest.Mock).mockResolvedValue(mockPaginateResult);

      const result = await service.findWithCities(mockQuery);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('1');
      expect(result.data[0].name).toBeDefined();
      expect(result.data[0].cities).toBeDefined();
      expect(result.data[0].cities).toHaveLength(1);
      expect(result.data[0].cities?.[0].id).toBe('10');
      expect(paginate).toHaveBeenCalled();
    });
  });
});
