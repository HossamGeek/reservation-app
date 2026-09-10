import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { ReservationStatusEnum } from 'src/libs/enums/reservation-status.enum';
import { UserStatusEnum } from 'src/libs/enums/user-status.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { POSTGRES_UNIQUE_VIOLATION_CODE } from 'src/libs/utils/postgres-error';
import { CreateReservationDto } from 'src/modules/reservations/dto/request/create-reservation.dto';
import { ReservationEntity } from 'src/modules/reservations/entities/reservation.entity';
import { ReservationsService } from 'src/modules/reservations/reservations.service';
import { ServiceService } from 'src/modules/service/service.service';
import { ShiftService } from 'src/modules/shifts/shift.service';
import { Not } from 'typeorm';

describe('ReservationsService', () => {
  let service: ReservationsService;

  const mockReservationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  const mockServiceService = {
    findOneBy: jest.fn(),
  };

  const mockShiftService = {
    findOneBy: jest.fn(),
  };

  const clientUser: ILoginUser = {
    id: 'user-1',
    phoneNumber: '+966500000000',
    type: UserTypeEnum.CLIENT,
    status: UserStatusEnum.ACTIVE,
    client: { id: '42' } as ILoginUser['client'],
    role: null,
  };

  const nonClientUser: ILoginUser = {
    id: 'user-2',
    phoneNumber: '+966500000001',
    type: UserTypeEnum.ADMIN,
    status: UserStatusEnum.ACTIVE,
    role: null,
  };

  const providerUser: ILoginUser = {
    id: 'user-3',
    phoneNumber: '+966500000002',
    type: UserTypeEnum.PROVIDER,
    status: UserStatusEnum.ACTIVE,
    providerAdmin: { providerId: '7' } as ILoginUser['providerAdmin'],
    role: null,
  };

  const validDto: CreateReservationDto = {
    serviceId: '10',
    shiftId: '20',
    date: '2026-09-10',
    notes: 'Please prepare the service in advance and confirm the booking details.',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(ReservationEntity),
          useValue: mockReservationRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
        {
          provide: ServiceService,
          useValue: mockServiceService,
        },
        {
          provide: ShiftService,
          useValue: mockShiftService,
        },
      ],
    }).compile();

    service = module.get(ReservationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should save a pending reservation and resolve without returning the entity', async () => {
      mockServiceService.findOneBy.mockResolvedValue({
        id: '10',
        isActive: true,
      });
      mockShiftService.findOneBy.mockResolvedValue({
        id: '20',
        isActive: true,
        providerId: '7',
      });
      mockReservationRepository.findOne.mockResolvedValue(null);

      const createdAt = new Date('2026-09-09T10:00:00.000Z');
      const createdEntity = {
        id: '1',
        clientId: '42',
        providerId: '7',
        serviceId: '10',
        shiftId: '20',
        date: '2026-09-10',
        status: ReservationStatusEnum.Pending,
        notes: 'Please prepare the service in advance and confirm the booking details.',
        createdAt,
        updatedAt: createdAt,
      } as ReservationEntity;

      mockReservationRepository.create.mockReturnValue(createdEntity);
      mockReservationRepository.save.mockResolvedValue(createdEntity);

      const result = await service.create(validDto, clientUser);

      expect(mockServiceService.findOneBy).toHaveBeenCalledWith({
        where: { id: '10', isActive: true },
      });
      expect(mockShiftService.findOneBy).toHaveBeenCalledWith({
        where: { id: '20' },
      });
      expect(mockReservationRepository.findOne).toHaveBeenCalledWith({
        where: {
          shiftId: '20',
          date: '2026-09-10',
          status: Not(ReservationStatusEnum.Cancelled),
        },
      });
      expect(mockReservationRepository.create).toHaveBeenCalledWith({
        clientId: '42',
        serviceId: '10',
        shiftId: '20',
        providerId: '7',
        date: '2026-09-10',
        notes: 'Please prepare the service in advance and confirm the booking details.',
        status: ReservationStatusEnum.Pending,
      });
      expect(mockReservationRepository.save).toHaveBeenCalledWith(createdEntity);
      expect(createdEntity.status).toBe(ReservationStatusEnum.Pending);
      expect(result).toBeUndefined();
    });

    it('should throw ForbiddenException when user is not a client', async () => {
      await expect(service.create(validDto, nonClientUser)).rejects.toThrow(
        new ForbiddenException(
          'reservations.errors.clientAssociationRequired',
        ),
      );

      expect(mockServiceService.findOneBy).not.toHaveBeenCalled();
      expect(mockReservationRepository.create).not.toHaveBeenCalled();
      expect(mockReservationRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when client association is missing', async () => {
      await expect(
        service.create(validDto, { ...clientUser, client: null }),
      ).rejects.toThrow(
        new ForbiddenException(
          'reservations.errors.clientAssociationRequired',
        ),
      );

      expect(mockServiceService.findOneBy).not.toHaveBeenCalled();
      expect(mockReservationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when service is missing', async () => {
      mockServiceService.findOneBy.mockResolvedValue(null);

      await expect(service.create(validDto, clientUser)).rejects.toThrow(
        new NotFoundException('reservations.errors.serviceNotFound'),
      );

      expect(mockShiftService.findOneBy).not.toHaveBeenCalled();
      expect(mockReservationRepository.create).not.toHaveBeenCalled();
      expect(mockReservationRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when service is unavailable or inactive', async () => {
      mockServiceService.findOneBy.mockResolvedValue(null);

      await expect(service.create(validDto, clientUser)).rejects.toThrow(
        new NotFoundException('reservations.errors.serviceNotFound'),
      );

      expect(mockReservationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when shift is missing', async () => {
      mockServiceService.findOneBy.mockResolvedValue({
        id: '10',
        isActive: true,
      });
      mockShiftService.findOneBy.mockResolvedValue(null);

      await expect(service.create(validDto, clientUser)).rejects.toThrow(
        new NotFoundException('reservations.errors.shiftNotFound'),
      );

      expect(mockReservationRepository.create).not.toHaveBeenCalled();
      expect(mockReservationRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when shift is inactive', async () => {
      mockServiceService.findOneBy.mockResolvedValue({
        id: '10',
        isActive: true,
      });
      mockShiftService.findOneBy.mockResolvedValue({
        id: '20',
        isActive: false,
        providerId: '7',
      });

      await expect(service.create(validDto, clientUser)).rejects.toThrow(
        new BadRequestException('reservations.errors.shiftInactive'),
      );

      expect(mockReservationRepository.create).not.toHaveBeenCalled();
      expect(mockReservationRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when a non-cancelled reservation exists for the shift and date', async () => {
      mockServiceService.findOneBy.mockResolvedValue({
        id: '10',
        isActive: true,
      });
      mockShiftService.findOneBy.mockResolvedValue({
        id: '20',
        isActive: true,
        providerId: '7',
      });
      mockReservationRepository.findOne.mockResolvedValue({
        id: '5',
        status: ReservationStatusEnum.Pending,
      });

      await expect(service.create(validDto, clientUser)).rejects.toThrow(
        new ConflictException('reservations.errors.conflict'),
      );

      expect(mockReservationRepository.create).not.toHaveBeenCalled();
      expect(mockReservationRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when save is rejected by the shift/date active unique index', async () => {
      mockServiceService.findOneBy.mockResolvedValue({
        id: '10',
        isActive: true,
      });
      mockShiftService.findOneBy.mockResolvedValue({
        id: '20',
        isActive: true,
        providerId: '7',
      });
      mockReservationRepository.findOne.mockResolvedValue(null);
      mockReservationRepository.create.mockReturnValue({
        id: '1',
        clientId: '42',
        providerId: '7',
        serviceId: '10',
        shiftId: '20',
        date: '2026-09-10',
        status: ReservationStatusEnum.Pending,
      } as ReservationEntity);
      mockReservationRepository.save.mockRejectedValue({
        driverError: {
          code: POSTGRES_UNIQUE_VIOLATION_CODE,
        },
      });

      await expect(service.create(validDto, clientUser)).rejects.toThrow(
        new ConflictException('reservations.errors.conflict'),
      );

      expect(mockReservationRepository.save).toHaveBeenCalled();
    });

    it('should rethrow unrelated save errors untouched', async () => {
      mockServiceService.findOneBy.mockResolvedValue({
        id: '10',
        isActive: true,
      });
      mockShiftService.findOneBy.mockResolvedValue({
        id: '20',
        isActive: true,
        providerId: '7',
      });
      mockReservationRepository.findOne.mockResolvedValue(null);
      mockReservationRepository.create.mockReturnValue({
        id: '1',
        clientId: '42',
        providerId: '7',
        serviceId: '10',
        shiftId: '20',
        date: '2026-09-10',
        status: ReservationStatusEnum.Pending,
      } as ReservationEntity);

      const unexpectedError = new Error('database unavailable');
      mockReservationRepository.save.mockRejectedValue(unexpectedError);

      await expect(service.create(validDto, clientUser)).rejects.toThrow(
        unexpectedError,
      );
    });
  });

  describe('confirm', () => {
    const createPendingReservation = (): ReservationEntity =>
      Object.assign(new ReservationEntity(), {
        id: '1',
        clientId: '42',
        providerId: '7',
        serviceId: '10',
        shiftId: '20',
        date: '2026-09-10',
        status: ReservationStatusEnum.Pending,
        notes: null,
      });

    const reservationWithStatus = (
      status: ReservationStatusEnum,
    ): ReservationEntity =>
      Object.assign(new ReservationEntity(), createPendingReservation(), {
        status,
      });

    it('should confirm a pending reservation with a provider-scoped conditional update', async () => {
      mockReservationRepository.findOne.mockResolvedValue(
        createPendingReservation(),
      );
      mockReservationRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.confirm('1', providerUser);

      expect(mockReservationRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', providerId: '7' },
      });
      expect(mockReservationRepository.update).toHaveBeenCalledWith(
        {
          id: '1',
          providerId: '7',
          status: ReservationStatusEnum.Pending,
        },
        { status: ReservationStatusEnum.Confirmed },
      );
      expect(result).toBeUndefined();
    });

    it('should throw ForbiddenException when user is not a provider', async () => {
      await expect(service.confirm('1', clientUser)).rejects.toThrow(
        new ForbiddenException(
          'reservations.errors.providerAssociationRequired',
        ),
      );

      expect(mockReservationRepository.findOne).not.toHaveBeenCalled();
      expect(mockReservationRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when provider association is missing', async () => {
      await expect(
        service.confirm('1', { ...providerUser, providerAdmin: null }),
      ).rejects.toThrow(
        new ForbiddenException(
          'reservations.errors.providerAssociationRequired',
        ),
      );

      expect(mockReservationRepository.findOne).not.toHaveBeenCalled();
      expect(mockReservationRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when reservation is missing', async () => {
      mockReservationRepository.findOne.mockResolvedValue(null);

      await expect(service.confirm('1', providerUser)).rejects.toThrow(
        new NotFoundException('reservations.errors.notFound'),
      );

      expect(mockReservationRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException without updating when reservation belongs to another provider', async () => {
      mockReservationRepository.findOne.mockResolvedValue(null);

      await expect(service.confirm('1', providerUser)).rejects.toThrow(
        new NotFoundException('reservations.errors.notFound'),
      );

      expect(mockReservationRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', providerId: '7' },
      });
      expect(mockReservationRepository.update).not.toHaveBeenCalled();
    });

    it.each([
      ReservationStatusEnum.Confirmed,
      ReservationStatusEnum.Cancelled,
      ReservationStatusEnum.Completed,
    ])('should reject a %s reservation without updating', async (status) => {
      mockReservationRepository.findOne.mockResolvedValue(
        reservationWithStatus(status),
      );

      await expect(service.confirm('1', providerUser)).rejects.toThrow(
        new ConflictException('reservations.errors.invalidState'),
      );

      expect(mockReservationRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when the conditional update affects 0 rows', async () => {
      mockReservationRepository.findOne.mockResolvedValue(
        createPendingReservation(),
      );
      mockReservationRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.confirm('1', providerUser)).rejects.toThrow(
        new ConflictException('reservations.errors.invalidState'),
      );

      expect(mockReservationRepository.update).toHaveBeenCalledWith(
        {
          id: '1',
          providerId: '7',
          status: ReservationStatusEnum.Pending,
        },
        { status: ReservationStatusEnum.Confirmed },
      );
    });
  });
});