import { Test, TestingModule } from '@nestjs/testing';
import { ProviderController } from 'src/modules/provider/provider.controller';
import { ProviderService } from 'src/modules/provider/provider.service';
import { I18nService } from 'nestjs-i18n';
import { PaginateQuery } from 'nestjs-paginate';
import { ApiResponse } from 'src/libs/errors/api-response';
import { CreateProviderDto } from 'src/modules/provider/dto/request/create-provider.dto';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { ProviderStatusEnum } from 'src/libs/enums/provider-status.enum';
import { UpdateProviderDto } from 'src/modules/provider/dto/request/update-provider.dto';

describe('ProviderController', () => {
  let controller: ProviderController;

  const mockProviderService = {
    create: jest.fn(),
    findAllJoinRequests: jest.fn(),
    updateApplicationStatus: jest.fn(),
    update: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderController],
      providers: [
        {
          provide: ProviderService,
          useValue: mockProviderService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    controller = module.get(ProviderController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a provider successfully', async () => {
      const dto = {} as CreateProviderDto;
      mockProviderService.create.mockResolvedValue(undefined);

      const mockUser = {} as ILoginUser;
      const result = await controller.create(dto, mockUser);

      expect(mockProviderService.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(
        ApiResponse.successResponse('providers.created', {}, 201),
      );
    });
  });

  describe('findAllJoinRequests', () => {
    it('should return paginated provider join requests', async () => {
      const paginated = {
        data: [],
        meta: {},
        links: {},
      };

      mockProviderService.findAllJoinRequests.mockResolvedValue(paginated);

      const query: PaginateQuery = {
        path: '/providers/join-requests',
      };
      const result = await controller.findAllJoinRequests(query);

      expect(mockProviderService.findAllJoinRequests).toHaveBeenCalledWith(
        query,
      );
      expect(result).toEqual(
        ApiResponse.successResponse(
          'providers.list.success',
          { joinRequests: paginated },
          200,
        ),
      );
    });
  });

  describe('updateApplicationStatus', () => {
    it('should successfully update provider application status', async () => {
      const dto = {
        status: ProviderStatusEnum.Approved,
        rejectionReason: null,
      };
      const mockUser = {} as ILoginUser;
      mockProviderService.updateApplicationStatus.mockResolvedValue(undefined);

      const result = await controller.updateApplicationStatus(
        { id: '1' },
        dto,
        mockUser,
      );

      expect(mockProviderService.updateApplicationStatus).toHaveBeenCalledWith(
        '1',
        dto,
        mockUser,
      );
      expect(result).toEqual(
        ApiResponse.successResponse('providers.application.reviewed', {}),
      );
    });
  });

  describe('update', () => {
    it('should successfully update provider information', async () => {
      const dto = {
        name: { ar: 'New Arabic Name', en: 'New English Name' },
      } as UpdateProviderDto;
      const mockUser = {} as ILoginUser;
      const updatedProvider = { id: '1' };

      mockProviderService.update.mockResolvedValue(updatedProvider);

      const result = await controller.update('1', dto, mockUser);

      expect(mockProviderService.update).toHaveBeenCalledWith(
        '1',
        dto,
        mockUser,
      );
      expect(result).toEqual(
        ApiResponse.successResponse('providers.update.success', {
          data: updatedProvider,
        }),
      );
    });
  });
});
