import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { PaginateQuery } from 'nestjs-paginate';
import { ApiResponse } from 'src/libs/errors/api-response';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { ServiceTypeController } from 'src/modules/category/service-type.controller';
import { ServiceTypeService } from 'src/modules/category/service-type.service';

describe('ServiceTypeController', () => {
  let controller: ServiceTypeController;

  const mockServiceTypeService = {
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
      controllers: [ServiceTypeController],
      providers: [
        {
          provide: ServiceTypeService,
          useValue: mockServiceTypeService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    controller = module.get(ServiceTypeController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated service types with their options', async () => {
      const paginatedResult = {
        data: [
          {
            id: '1',
            name: 'Service Type 1',
            isActive: true,
            supportsOptions: true,
            options: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        meta: {},
        links: {},
      };

      mockServiceTypeService.findAll.mockResolvedValue(paginatedResult);

      const query: PaginateQuery = {
        path: '/service-types',
      };
      const result = await controller.findAll(query);

      expect(mockServiceTypeService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(
        ApiResponse.successResponse('services-types.getAll.success', {
          data: paginatedResult,
        }),
      );
    });
  });

  describe('updateStatus', () => {
    it('should update service type status successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: true,
      };

      mockServiceTypeService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: '1' }, dto);

      expect(mockServiceTypeService.updateStatus).toHaveBeenCalledWith(
        '1',
        dto,
      );
      expect(result).toEqual(
        ApiResponse.successResponse('services-types.activate.success', {}),
      );
    });
  });
});
