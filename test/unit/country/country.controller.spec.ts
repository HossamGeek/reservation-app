import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { PaginateQuery } from 'nestjs-paginate';
import { ApiResponse } from 'src/libs/errors/api-response';
import { CountryController } from 'src/modules/country/country.controller';
import { CountryService } from 'src/modules/country/country.service';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';

describe('CountryController', () => {
  let controller: CountryController;

  const mockCountryService = {
    findAll: jest.fn(),
    findWithCities: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountryController],
      providers: [
        {
          provide: CountryService,
          useValue: mockCountryService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    controller = module.get(CountryController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated countries', async () => {
      const paginated = {
        data: [],
        meta: {},
        links: {},
      };

      mockCountryService.findAll.mockResolvedValue(paginated);

      const query: PaginateQuery = {
        path: '/countries',
      };
      const result = await controller.findAll(query);

      expect(mockCountryService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(
        ApiResponse.successResponse(
          'countries.getAll.success',
          {
            countries: paginated,
          },
          200,
        ),
      );
    });
  });

  describe('findWithCities', () => {
    it('should return paginated countries with their cities', async () => {
      const paginated = {
        data: [
          {
            id: '1',
            name: 'Jordan',
            isActive: true,
            cities: [],
          },
        ],
        meta: {},
        links: {},
      };

      mockCountryService.findWithCities.mockResolvedValue(paginated);

      const query: PaginateQuery = {
        path: '/countries/with-cities',
      };
      const result = await controller.findWithCities(query);

      expect(mockCountryService.findWithCities).toHaveBeenCalledWith(query);
      expect(result).toEqual(
        ApiResponse.successResponse(
          'countries.getAll.success',
          {
            countries: paginated,
          },
          200,
        ),
      );
    });
  });

  describe('updateStatus', () => {
    it('should activate country successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: true,
      };

      mockCountryService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: '1' }, dto);

      expect(mockCountryService.updateStatus).toHaveBeenCalledWith('1', true);
      expect(result).toEqual(
        ApiResponse.successResponse('countries.activate.success', {}, 200),
      );
    });

    it('should deactivate country successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: false,
      };

      mockCountryService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: '1' }, dto);

      expect(mockCountryService.updateStatus).toHaveBeenCalledWith('1', false);
      expect(result).toEqual(
        ApiResponse.successResponse('countries.deactivate.success', {}, 200),
      );
    });
  });
});
