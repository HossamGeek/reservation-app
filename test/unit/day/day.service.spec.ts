import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DayService } from 'src/modules/day/day.service';
import { DayEntity } from 'src/modules/day/entities/day.entity';

describe('DayService', () => {
  let service: DayService;

  const mockRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DayService,
        {
          provide: getRepositoryToken(DayEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get(DayService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all days sorted by sortOrder ascending', async () => {
      const mockDays = [
        { id: '1', nameEn: 'saturday', nameAr: 'السبت', sortOrder: 1 },
        { id: '2', nameEn: 'sunday', nameAr: 'الأحد', sortOrder: 2 },
      ] as DayEntity[];

      mockRepository.find.mockResolvedValue(mockDays);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[0].name).toBe('saturday');
      expect(result[0].sortOrder).toBe(1);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: {
          sortOrder: 'ASC',
        },
      });
    });
  });
});
