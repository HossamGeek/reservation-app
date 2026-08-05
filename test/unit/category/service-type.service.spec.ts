import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { PaginateQuery } from 'nestjs-paginate';
import { ServiceTypeService } from 'src/modules/category/service-type.service';
import { ServiceTypeEntity } from 'src/modules/category/entities/service-type.entity';

// Mock nestjs-paginate to bypass actual SQL compilation
jest.mock('nestjs-paginate', () => ({
  paginate: jest.fn().mockResolvedValue({
    data: [],
    meta: {},
    links: {},
  }),
}));

describe('ServiceTypeService', () => {
  let service: ServiceTypeService;
  const leftJoinAndSelect = jest.fn().mockReturnThis();
  const where = jest.fn().mockReturnThis();
  const andWhere = jest.fn().mockReturnThis();

  const mockServiceTypeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softRemove: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect,
      where,
      andWhere,
    })),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceTypeService,
        {
          provide: getRepositoryToken(ServiceTypeEntity),
          useValue: mockServiceTypeRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    service = module.get(ServiceTypeService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated service types with their options and option logos', async () => {
      const query: PaginateQuery = { path: '/service-types' };
      const result = await service.findAll(query);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(leftJoinAndSelect).toHaveBeenCalledWith(
        'serviceType.options',
        'options',
      );
      expect(leftJoinAndSelect).toHaveBeenCalledWith('options.logo', 'logo');
    });

    it('should filter active service types and only load active options for mobile', async () => {
      const query: PaginateQuery = { path: '/client/services/types' };

      await service.findAll(query, { isMobile: true });

      expect(leftJoinAndSelect).toHaveBeenCalledWith(
        'serviceType.options',
        'options',
        'options.isActive = :isActive',
        { isActive: true },
      );
      expect(leftJoinAndSelect).toHaveBeenCalledWith('options.logo', 'logo');
      expect(where).toHaveBeenCalledWith(
        'serviceType.isActive = :isActive',
        { isActive: true },
      );
      expect(andWhere).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update service type isActive status successfully', async () => {
      const serviceType = { id: '1', isActive: false } as ServiceTypeEntity;
      mockServiceTypeRepository.findOne.mockResolvedValue(serviceType);
      mockServiceTypeRepository.save.mockImplementation((st) =>
        Promise.resolve(st),
      );

      await service.updateStatus('1', { isActive: true });

      expect(serviceType.isActive).toBe(true);
      expect(mockServiceTypeRepository.save).toHaveBeenCalledWith(serviceType);
    });

    it('should throw NotFoundException if service type does not exist', async () => {
      mockServiceTypeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus('1', { isActive: true }),
      ).rejects.toThrow('services-types.errors.notFound');
    });
  });
});
