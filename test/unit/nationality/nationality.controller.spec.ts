import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { PaginateQuery } from 'nestjs-paginate';
import { ApiResponse } from 'src/libs/errors/api-response';
import { NationalityController } from 'src/modules/nationality/nationality.controller';
import { NationalityService } from 'src/modules/nationality/nationality.service';
import { CreateNationalityDto } from 'src/modules/nationality/dto/request/create-nationality.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';

describe('NationalityController', () => {
  let controller: NationalityController;

  const mockNationalityService = {
    create: jest.fn(),
    findAll: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NationalityController],
      providers: [
        {
          provide: NationalityService,
          useValue: mockNationalityService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    controller = module.get(NationalityController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a nationality successfully', async () => {
      const dto: CreateNationalityDto = {
        name: {
          en: 'Jordanian',
          ar: 'أردني',
        },
      };

      const result = await controller.create(dto);

      expect(mockNationalityService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(
        ApiResponse.successResponse('nationalities.create.success', {}, 201),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated nationalities', async () => {
      const paginated = {
        data: [],
        meta: {},
        links: {},
      };

      mockNationalityService.findAll.mockResolvedValue(paginated);

      const query: PaginateQuery = {
        path: '/nationalities',
      };
      const result = await controller.findAll(query);

      expect(mockNationalityService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(
        ApiResponse.successResponse(
          'nationalities.getAll.success',
          { nationalities: paginated },
          200,
        ),
      );
    });
  });

  describe('updateStatus', () => {
    it('should activate nationality successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: true,
      };

      mockNationalityService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: '1' }, dto);

      expect(mockNationalityService.updateStatus).toHaveBeenCalledWith(
        '1',
        true,
      );
      expect(result).toEqual(
        ApiResponse.successResponse('nationalities.activate.success', {}, 200),
      );
    });

    it('should deactivate nationality successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: false,
      };

      mockNationalityService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: '1' }, dto);

      expect(mockNationalityService.updateStatus).toHaveBeenCalledWith(
        '1',
        false,
      );
      expect(result).toEqual(
        ApiResponse.successResponse(
          'nationalities.deactivate.success',
          {},
          200,
        ),
      );
    });
  });
});
