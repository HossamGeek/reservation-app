import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { ApiResponse } from 'src/libs/errors/api-response';
import { ShiftController } from 'src/modules/shifts/shift.controller';
import { ShiftService } from 'src/modules/shifts/shift.service';
import { CreateShiftDto } from 'src/modules/shifts/dto/request/create-shift.dto';
import { UpdateShiftDto } from 'src/modules/shifts/dto/request/update-shift.dto';
import { UserStatusEnum } from 'src/libs/enums/user-status.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { UpdateStatusDto } from 'src/libs/dto/update-status.dto';

describe('ShiftController', () => {
  let controller: ShiftController;

  const mockShiftService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftController],
      providers: [
        {
          provide: ShiftService,
          useValue: mockShiftService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    controller = module.get(ShiftController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findProviderShifts', () => {
    it('should delegate query and authenticated user to service and return provider shifts', async () => {
      const shifts = { data: [], meta: { totalItems: 0 }, links: {} };
      const query = { path: '/shifts', page: 1, limit: 20 };
      const user: ILoginUser = {
        id: 'user-1',
        email: 'provider@example.com',
        phoneNumber: '+966500000000',
        type: UserTypeEnum.PROVIDER,
        status: UserStatusEnum.ACTIVE,
        role: null,
      };

      mockShiftService.findAll.mockResolvedValue(shifts);

      const result = await controller.findAll(query, user);

      expect(mockShiftService.findAll).toHaveBeenCalledWith(
        query,
        user,
      );
      expect(result).toEqual(
        ApiResponse.successResponse('shifts.getAll.success', { shifts }),
      );
    });
  });

  describe('create', () => {
    it('should create shift successfully', async () => {
      const dto: CreateShiftDto = {
        providerId: 'provider-1',
        name: 'Morning',
        fromHour: 9,
        toHour: 17,
      };

      mockShiftService.create.mockResolvedValue(undefined);

      const result = await controller.create(dto);

      expect(mockShiftService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(
        ApiResponse.successResponse('shifts.create.success', {}, 201),
      );
    });
  });

  describe('update', () => {
    it('should update shift successfully', async () => {
      const dto: UpdateShiftDto = {
        name: 'Evening Shift',
        fromHour: 16,
        toHour: 22,
      };

      mockShiftService.update.mockResolvedValue(undefined);

      const result = await controller.update({ id: 'shift-1' }, dto);

      expect(mockShiftService.update).toHaveBeenCalledWith('shift-1', dto);
      expect(result).toEqual(
        ApiResponse.successResponse('shifts.update.success', {}, 200),
      );
    });
  });

  describe('updateStatus', () => {
    it('should update shift status successfully', async () => {
      const dto: UpdateStatusDto = {
        isActive: true,
      };

      mockShiftService.updateStatus.mockResolvedValue(undefined);

      const result = await controller.updateStatus({ id: 'shift-1' }, dto);

      expect(mockShiftService.updateStatus).toHaveBeenCalledWith(
        'shift-1',
        true,
      );
      expect(result).toEqual(
        ApiResponse.successResponse('shifts.activate.success', {}),
      );
    });
  });
});
