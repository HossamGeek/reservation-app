import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { ApiResponse } from 'src/libs/errors/api-response';
import { CreateServiceTypeOptionDto } from 'src/modules/category/dto/request/create-service-type-option.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';
import { ServiceTypeOptionController } from 'src/modules/category/service-type-option.controller';
import { ServiceTypeOptionService } from 'src/modules/category/service-type-option.service';

describe('ServiceTypeOptionController', () => {
  let controller: ServiceTypeOptionController;

  const mockServiceTypeOptionService = {
    create: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceTypeOptionController],
      providers: [
        {
          provide: ServiceTypeOptionService,
          useValue: mockServiceTypeOptionService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    controller = module.get(ServiceTypeOptionController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create service type option successfully', async () => {
      const dto: CreateServiceTypeOptionDto = {
        serviceTypeId: '1',
        name: {
          ar: 'زيارة متعددة',
          en: 'Multi Visit',
        },
         description: {
          ar: 'وصف الفئة بالعربية',
          en: 'Category description in English',
        },
        logoId: '123',
      };

      mockServiceTypeOptionService.create.mockResolvedValue(undefined);

      const result = await controller.create(dto);

      expect(mockServiceTypeOptionService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(
        ApiResponse.successResponse(
          'service-type-options.create.success',
          {},
          201,
        ),
      );
    });
  });

  describe('updateStatus', () => {
    it('should update service type option status successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: true,
      };

      mockServiceTypeOptionService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: '1' }, dto);

      expect(mockServiceTypeOptionService.updateStatus).toHaveBeenCalledWith(
        '1',
        dto,
      );
      expect(result).toEqual(
        ApiResponse.successResponse(
          'service-type-options.activate.success',
          {},
          200,
        ),
      );
    });
  });
});
