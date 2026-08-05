import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { PaginateQuery } from 'nestjs-paginate';
import { ApiResponse } from 'src/libs/errors/api-response';
import { ReligionController } from 'src/modules/religion/religion.controller';
import { ReligionService } from 'src/modules/religion/religion.service';
import { CreateReligionDto } from 'src/modules/religion/dto/request/create-religion.dto';
import { UpdateReligionDto } from 'src/modules/religion/dto/request/update-religion.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';

describe('ReligionsController', () => {
  let controller: ReligionController;

  const mockReligionsService = {
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
      controllers: [ReligionController],
      providers: [
        {
          provide: ReligionService,
          useValue: mockReligionsService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    controller = module.get(ReligionController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a religion successfully', async () => {
      const dto: CreateReligionDto = {
        name: {
          ar: 'مسلم',
          en: 'Muslim',
        },
      };

      const result = await controller.create(dto);

      expect(mockReligionsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(
        ApiResponse.successResponse('religions.create.success', {}, 201),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated religions', async () => {
      const paginated = {
        data: [],
        meta: {},
        links: {},
      };

      mockReligionsService.findAll.mockResolvedValue(paginated);

      const query: PaginateQuery = {
        path: '/religions',
      };
      const result = await controller.findAll(query);

      expect(mockReligionsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(
        ApiResponse.successResponse(
          'religions.getAll.success',
          { religions: paginated },
          200,
        ),
      );
    });
  });

  describe('update', () => {
    it('should update a religion successfully', async () => {
      const dto: UpdateReligionDto = {
        name: {
          ar: 'مسيحي',
          en: 'Christian',
        },
      };

      const result = await controller.update({ id: '1' }, dto);

      expect(mockReligionsService.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(
        ApiResponse.successResponse('religions.update.success', {}, 200),
      );
    });
  });

  describe('updateStatus', () => {
    it('should activate religion successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: true,
      };

      mockReligionsService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: '1' }, dto);

      expect(mockReligionsService.updateStatus).toHaveBeenCalledWith('1', true);
      expect(result).toEqual(
        ApiResponse.successResponse('religions.activate.success', {}, 200),
      );
    });

    it('should deactivate religion successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: false,
      };

      mockReligionsService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: '1' }, dto);

      expect(mockReligionsService.updateStatus).toHaveBeenCalledWith(
        '1',
        false,
      );
      expect(result).toEqual(
        ApiResponse.successResponse('religions.deactivate.success', {}, 200),
      );
    });
  });
});
