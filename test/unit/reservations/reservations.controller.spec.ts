import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { UserStatusEnum } from 'src/libs/enums/user-status.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ApiResponse } from 'src/libs/errors/api-response';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { CreateReservationDto } from 'src/modules/reservations/dto/request/create-reservation.dto';
import { ReservationsController } from 'src/modules/reservations/reservations.controller';
import { ReservationsService } from 'src/modules/reservations/reservations.service';

describe('ReservationsController', () => {
  let controller: ReservationsController;

  const mockReservationsService = {
    create: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
      ],
    }).compile();

    controller = module.get(ReservationsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should forward DTO and authenticated user to the service and return a 201 ApiResponse with empty data', async () => {
      const dto: CreateReservationDto = {
        serviceId: '10',
        shiftId: '20',
        date: '2026-09-10',
        notes: 'Please prepare the service in advance and confirm the booking details.',
      };

      const user: ILoginUser = {
        id: 'user-1',
        phoneNumber: '+966500000000',
        type: UserTypeEnum.CLIENT,
        status: UserStatusEnum.ACTIVE,
        client: { id: '42' } as ILoginUser['client'],
        role: null,
      };

      mockReservationsService.create.mockResolvedValue(undefined);

      const result = await controller.create(dto, user);

      expect(mockReservationsService.create).toHaveBeenCalledWith(dto, user);
      expect(result).toEqual(
        ApiResponse.successResponse('reservations.create.success', {}, 201),
      );
    });
  });
});