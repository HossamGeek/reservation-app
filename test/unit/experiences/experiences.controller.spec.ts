import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { PaginateQuery } from 'nestjs-paginate';
import { ApiResponse } from 'src/libs/errors/api-response';
import { ExperienceController } from 'src/modules/experience/experience.controller';
import { ExperienceService } from 'src/modules/experience/experience.service';
import { CreateExperienceDto } from 'src/modules/experience/dto/request/create-experience.dto';
import { UpdateExperienceDto } from 'src/modules/experience/dto/request/update-experience.dto';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';

describe('ExperiencesController', () => {
  let controller: ExperienceController;

  const mockExperiencesService = {
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
      controllers: [ExperienceController],
      providers: [
        {
          provide: ExperienceService,
          useValue: mockExperiencesService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    controller = module.get(ExperienceController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an experience successfully', async () => {
      const dto: CreateExperienceDto = {
        minYears: 2,
        maxYears: 3,
      };

      const result = await controller.create(dto);

      expect(mockExperiencesService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(
        ApiResponse.successResponse('experiences.create.success', {}, 201),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated experiences', async () => {
      const paginated = {
        data: [],
        meta: {},
        links: {},
      };

      mockExperiencesService.findAll.mockResolvedValue(paginated);

      const query: PaginateQuery = {
        path: '/experiences',
      };
      const result = await controller.findAll(query);

      expect(mockExperiencesService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(
        ApiResponse.successResponse(
          'experiences.getAll.success',
          { experiences: paginated },
          200,
        ),
      );
    });
  });

  describe('update', () => {
    it('should update an experience successfully', async () => {
      const dto: UpdateExperienceDto = {
        minYears: 3,
        maxYears: 4,
      };

      const result = await controller.update({ id: '1' }, dto);

      expect(mockExperiencesService.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(
        ApiResponse.successResponse('experiences.update.success', {}, 200),
      );
    });
  });

  describe('updateStatus', () => {
    it('should activate experience successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: true,
      };

      mockExperiencesService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: '1' }, dto);

      expect(mockExperiencesService.updateStatus).toHaveBeenCalledWith(
        '1',
        true,
      );
      expect(result).toEqual(
        ApiResponse.successResponse('experiences.activate.success', {}, 200),
      );
    });

    it('should deactivate experience successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: false,
      };

      mockExperiencesService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: '1' }, dto);

      expect(mockExperiencesService.updateStatus).toHaveBeenCalledWith(
        '1',
        false,
      );
      expect(result).toEqual(
        ApiResponse.successResponse('experiences.deactivate.success', {}, 200),
      );
    });
  });
});
