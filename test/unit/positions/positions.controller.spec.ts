import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { PaginateQuery } from 'nestjs-paginate';
import { ApiResponse } from 'src/libs/errors/api-response';
import { PositionController } from 'src/modules/position/position.controller';
import { PositionService } from 'src/modules/position/position.service';
import { CreatePositionDto } from 'src/modules/position/dto/request/create-position.dto';
import { UpdatePositionDto } from 'src/modules/position/dto/request/update-position.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';

describe('PositionsController', () => {
  let controller: PositionController;

  const mockPositionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PositionController],
      providers: [
        {
          provide: PositionService,
          useValue: mockPositionsService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    controller = module.get(PositionController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a position successfully', async () => {
      const dto: CreatePositionDto = {
        name: {
          ar: 'سائق',
          en: 'Driver',
        },
      };

      const result = await controller.create(dto);

      expect(mockPositionsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(
        ApiResponse.successResponse('positions.create.success', {}, 201),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated positions', async () => {
      const paginated = {
        data: [],
        meta: {},
        links: {},
      };

      mockPositionsService.findAll.mockResolvedValue(paginated);

      const query: PaginateQuery = {
        path: '/positions',
      };
      const result = await controller.findAll(query);

      expect(mockPositionsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(
        ApiResponse.successResponse(
          'positions.getAll.success',
          { positions: paginated },
          200,
        ),
      );
    });
  });

  describe('update', () => {
    it('should update a position successfully', async () => {
      const dto: UpdatePositionDto = {
        name: {
          ar: 'مربية أطفال',
          en: 'Nanny',
        },
      };

      const result = await controller.update({ id: '1' }, dto);

      expect(mockPositionsService.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(
        ApiResponse.successResponse('positions.update.success', {}, 200),
      );
    });
  });

  describe('updateStatus', () => {
    it('should activate position successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: true,
      };

      mockPositionsService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: '1' }, dto);

      expect(mockPositionsService.updateStatus).toHaveBeenCalledWith('1', true);
      expect(result).toEqual(
        ApiResponse.successResponse('positions.activate.success', {}, 200),
      );
    });

    it('should deactivate position successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: false,
      };

      mockPositionsService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: '1' }, dto);

      expect(mockPositionsService.updateStatus).toHaveBeenCalledWith(
        '1',
        false,
      );
      expect(result).toEqual(
        ApiResponse.successResponse('positions.deactivate.success', {}, 200),
      );
    });
  });
});
