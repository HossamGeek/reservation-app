import { I18nService } from 'nestjs-i18n';
import { PaginateQuery } from 'nestjs-paginate';
import { ACTION_KEY } from 'src/libs/decorators/entity-action.decorator';
import { ActionsEnum } from 'src/libs/enums/permission.enum';
import { CreateServiceDto } from 'src/modules/service/dto/request/create-service.dto';
import { ServiceController } from 'src/modules/service/service.controller';
import { ServiceService } from 'src/modules/service/service.service';

describe('ServicesController', () => {
  let controller: ServiceController;
  let servicesService: {
    create: jest.Mock;
    getStatistics: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
  };
  let i18n: { t: jest.Mock };

  const createDto: CreateServiceDto = {
    categoryId: '1',
    serviceTypeId: '5',
    logoId: '2',
    name: { ar: 'تنظيف منزلي', en: 'Home Cleaning' },
    description: {
      ar: 'خدمة تنظيف منزلي احترافية',
      en: 'Professional home cleaning service',
    },
  };

  beforeEach(() => {
    servicesService = {
      create: jest.fn(),
      getStatistics: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    i18n = { t: jest.fn((key: string) => key) };
    controller = new ServiceController(
      servicesService as unknown as ServiceService,
      i18n as unknown as I18nService,
    );
  });

  it('should require create permission for create endpoint', () => {
    expect(Reflect.getMetadata(ACTION_KEY, controller.create)).toEqual([
      ActionsEnum.create,
    ]);
  });

  it('should require listView permission for statistics endpoint', () => {
    expect(Reflect.getMetadata(ACTION_KEY, controller.getStatistics)).toEqual([
      ActionsEnum.listView,
    ]);
  });

  it('should require listView permission for findAll endpoint', () => {
    expect(Reflect.getMetadata(ACTION_KEY, controller.findAll)).toEqual([
      ActionsEnum.listView,
    ]);
  });

  it('should require detailedView permission for findOne endpoint', () => {
    expect(Reflect.getMetadata(ACTION_KEY, controller.findOne)).toEqual([
      ActionsEnum.detailedView,
    ]);
  });

  it('should return created service success message only', async () => {
    servicesService.create.mockResolvedValue(undefined);

    const result = await controller.create(createDto);

    expect(result).toEqual(
      expect.objectContaining({
        message: 'services.success.created',
        status: 201,
      }),
    );
  });

  it('should call servicesService.getStatistics', async () => {
    const statistics = {
      totalServices: 1,
      activeServices: 0,
      inactiveServices: 1,
      totalServiceRequests: 0,
    };
    servicesService.getStatistics.mockResolvedValue(statistics);

    await controller.getStatistics();

    expect(servicesService.getStatistics).toHaveBeenCalled();
  });

  it('should return statistics response', async () => {
    const statistics = {
      totalServices: 1,
      activeServices: 0,
      inactiveServices: 1,
      totalServiceRequests: 0,
    };
    servicesService.getStatistics.mockResolvedValue(statistics);

    const result = await controller.getStatistics();

    expect(result).toEqual(
      expect.objectContaining({
        message: 'services.success.statistics',
        data: statistics,
      }),
    );
  });

  it('should call servicesService.findAll', async () => {
    const query = { page: 1, limit: 10 } as unknown as PaginateQuery;
    const paginatedResponse = {
      data: [
        { id: '1', name: 'Home Cleaning', logo: 'http://...', isActive: true },
      ],
      meta: { totalItems: 1, itemsPerPage: 10 },
    };
    servicesService.findAll.mockResolvedValue(paginatedResponse);

    const result = await controller.findAll(query);

    expect(servicesService.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual(
      expect.objectContaining({
        message: 'services.success.getAll',
        services: paginatedResponse,
      }),
    );
  });

  it('should call servicesService.findOne', async () => {
    const serviceDetails = {
      id: '1',
      name: 'Home Cleaning',
      description: 'Clean',
      logo: 'http://...',
      logoUrl: 'http://...',
      isActive: true,
      category: { id: '2', name: 'Cleaning' },
      serviceType: { id: '3', name: 'Hourly', supportsOptions: false },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    servicesService.findOne.mockResolvedValue(serviceDetails);

    const result = await controller.findOne({ id: '1' });

    expect(servicesService.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual(
      expect.objectContaining({
        message: 'services.success.getOne',
        data: serviceDetails,
      }),
    );
  });
});
