import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { ApiResponse } from 'src/libs/errors/api-response';
import { DayController } from 'src/modules/day/day.controller';
import { DayService } from 'src/modules/day/day.service';
import { DayResponseDto } from 'src/modules/day/dto/response/day-response.dto';

describe('DayController', () => {
  let controller: DayController;

  const mockDayService = {
    findAll: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DayController],
      providers: [
        {
          provide: DayService,
          useValue: mockDayService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    controller = module.get(DayController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all days of the week', async () => {
      const mockDaysList: DayResponseDto[] = [
        { id: '1', name: 'saturday', sortOrder: 1 },
        { id: '2', name: 'sunday', sortOrder: 2 },
      ];

      mockDayService.findAll.mockResolvedValue(mockDaysList);

      const result = await controller.findAll();

      expect(mockDayService.findAll).toHaveBeenCalled();
      expect(result).toEqual(
        ApiResponse.successResponse(
          'days.getAll.success',
          { days: mockDaysList },
          200,
        ),
      );
    });
  });
});
