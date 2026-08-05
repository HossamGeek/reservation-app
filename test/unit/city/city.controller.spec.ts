import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { PaginateQuery } from 'nestjs-paginate';
import { ApiResponse } from 'src/libs/errors/api-response';
import { IS_PUBLIC_KEY } from 'src/libs/decorators/public.decorator';
import { CityController } from 'src/modules/city/city.controller';
import { CityService } from 'src/modules/city/city.service';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';

describe('CityController', () => {
  let controller: CityController;

  const mockCityService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    create: jest.fn(),
    getSaudiArabiaCities: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityController],
      providers: [
        {
          provide: CityService,
          useValue: mockCityService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    controller = module.get(CityController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated cities', async () => {
      const paginated = {
        data: [],
        meta: {},
        links: {},
      };

      mockCityService.findAll.mockResolvedValue(paginated);

      const query: PaginateQuery = {
        path: '/cities',
      };
      const result = await controller.findAll(query);

      expect(mockCityService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(
        ApiResponse.successResponse(
          'cities.getAll.success',
          {
            cities: paginated,
          },
          200,
        ),
      );
    });
  });

  describe('getSaudiArabiaCities', () => {
    it('should delegate query to service and return paginated Saudi Arabia cities', async () => {
      const paginated = {
        data: [{ id: '1', nameAr: 'الرياض', nameEn: 'Riyadh' }],
        meta: {},
        links: {},
      };
      const query: PaginateQuery = {
        path: '/cities/saudi-arabia',
        page: 1,
        limit: 20,
      };

      mockCityService.getSaudiArabiaCities.mockResolvedValue(paginated);

      const result = await controller.getSaudiArabiaCities(query);

      expect(mockCityService.getSaudiArabiaCities).toHaveBeenCalledTimes(1);
      expect(mockCityService.getSaudiArabiaCities).toHaveBeenCalledWith(query);
      expect(result).toEqual(
        ApiResponse.successResponse('cities.getAll.success', {
          cities: paginated,
        }),
      );
    });

    it('should be marked as public', () => {
      const isPublic = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        controller.getSaudiArabiaCities,
      );

      expect(isPublic).toBe(true);
    });
  });

  describe('updateStatus', () => {
    it('should activate city successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: true,
      };

      mockCityService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: '1' }, dto);

      expect(mockCityService.updateStatus).toHaveBeenCalledWith('1', true);
      expect(result).toEqual(
        ApiResponse.successResponse('cities.activate.success', {}, 200),
      );
    });

    it('should deactivate city successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: false,
      };

      mockCityService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: '1' }, dto);

      expect(mockCityService.updateStatus).toHaveBeenCalledWith('1', false);
      expect(result).toEqual(
        ApiResponse.successResponse('cities.deactivate.success', {}, 200),
      );
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
      const result = await controller.create(dto);

      expect(mockCityService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(
        ApiResponse.successResponse('cities.create.success', {}, 201),
      );
    });
  });
});
