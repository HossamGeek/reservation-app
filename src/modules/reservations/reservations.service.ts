import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { BaseEntityService } from 'src/libs/base-service/base-entity.service';
import { ReservationStatusEnum } from 'src/libs/enums/reservation-status.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { isPostgresUniqueViolation } from 'src/libs/utils/postgres-error';
import { ServiceService } from 'src/modules/service/service.service';
import { ShiftService } from 'src/modules/shifts/shift.service';
import { Not, Repository } from 'typeorm';
import { CreateReservationDto } from './dto/request/create-reservation.dto';
import { ReservationEntity } from './entities/reservation.entity';

@Injectable()
export class ReservationsService extends BaseEntityService<ReservationEntity> {
  constructor(
    @InjectRepository(ReservationEntity)
    repository: Repository<ReservationEntity>,
    i18n: I18nService,
    private readonly serviceService: ServiceService,
    private readonly shiftService: ShiftService,
  ) {
    super(repository, i18n);
  }

  async create(
    createReservationDto: CreateReservationDto,
    user: ILoginUser,
  ): Promise<void> {
    const clientId = this.getAuthenticatedClientId(user);

    const service = await this.serviceService.findOneBy({
      where: { id: createReservationDto.serviceId, isActive: true },
    });

    if (!service) {
      throw new NotFoundException(
        this.i18n.t('reservations.errors.serviceNotFound'),
      );
    }

    const shift = await this.shiftService.findOneBy({
      where: { id: createReservationDto.shiftId },
    });

    if (!shift) {
      throw new NotFoundException(
        this.i18n.t('reservations.errors.shiftNotFound'),
      );
    }

    if (!shift.isActive) {
      throw new BadRequestException(
        this.i18n.t('reservations.errors.shiftInactive'),
      );
    }

    const existingReservation = await this.findOneBy({
      where: {
        shiftId: createReservationDto.shiftId,
        date: createReservationDto.date,
        status: Not(ReservationStatusEnum.Cancelled),
      },
    });

    if (existingReservation) {
      throw new ConflictException(
        this.i18n.t('reservations.errors.conflict'),
      );
    }

    const reservation = this.repository.create({
      clientId,
      serviceId: createReservationDto.serviceId,
      shiftId: createReservationDto.shiftId,
      providerId: shift.providerId,
      date: createReservationDto.date,
      notes: createReservationDto.notes ?? null,
      status: ReservationStatusEnum.Pending,
    });

    try {
      await this.repository.save(reservation);
    } catch (error) {
      if (isPostgresUniqueViolation(error)) {
        throw new ConflictException(
          this.i18n.t('reservations.errors.conflict'),
        );
      }

      throw error;
    }
  }

  protected getNotFoundMessage(): string {
    return this.i18n.t('reservations.errors.serviceNotFound');
  }

  private getAuthenticatedClientId(user: ILoginUser): string {
    if (user.type !== UserTypeEnum.CLIENT || !user.client?.id) {
      throw new ForbiddenException(
        this.i18n.t('reservations.errors.clientAssociationRequired'),
      );
    }

    return user.client.id;
  }
}