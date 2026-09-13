import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { BaseEntityService } from 'src/libs/base-service/base-entity.service';
import { ReservationStatusEnum } from 'src/libs/enums/reservation-status.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { isPostgresUniqueViolation } from 'src/libs/utils/postgres-error';
import { ReservationTranslationMapper } from 'src/libs/mappers/reservation-translation.mapper';
import { getProviderReservationsPaginationConfig } from 'src/libs/pagination/provider-reservations.pagination';
import { ServiceService } from 'src/modules/service/service.service';
import { ShiftService } from 'src/modules/shifts/shift.service';
import { Not, Repository } from 'typeorm';
import { CreateReservationDto } from './dto/request/create-reservation.dto';
import { ReservationResponseDto } from './dto/response/reservation-response.dto';
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

  async confirm(id: string, user: ILoginUser): Promise<void> {
    const providerId = this.getAuthenticatedProviderId(user);

    const reservation = await this.findOneBy({
      where: { id, providerId },
    });

    if (!reservation) {
      throw new NotFoundException(this.i18n.t('reservations.errors.notFound'));
    }

    if (reservation.status !== ReservationStatusEnum.Pending) {
      throw new ConflictException(
        this.i18n.t('reservations.errors.invalidState'),
      );
    }

    const result = await this.repository.update(
      {
        id,
        providerId,
        status: ReservationStatusEnum.Pending,
      },
      {
        status: ReservationStatusEnum.Confirmed,
      },
    );

    if (result.affected !== 1) {
      throw new ConflictException(
        this.i18n.t('reservations.errors.invalidState'),
      );
    }
  }
  async findProviderReservations(
    query: PaginateQuery,
    user: ILoginUser,
  ): Promise<Paginated<ReservationResponseDto>> {
    const providerId = this.getAuthenticatedProviderId(user);

    const queryBuilder = this.repository
      .createQueryBuilder('reservation')
      .where('reservation.providerId = :providerId', { providerId })
      .leftJoinAndSelect('reservation.client', 'client')
      .leftJoinAndSelect('client.user', 'clientUser')
      .leftJoinAndSelect('reservation.service', 'service')
      .leftJoinAndSelect('reservation.shift', 'shift');

    const result = await paginate(
      query,
      queryBuilder,
      getProviderReservationsPaginationConfig,
    );

    return {
      ...result,
      data: ReservationTranslationMapper.toResponses(result.data),
    } as Paginated<ReservationResponseDto>;
  }

  protected getNotFoundMessage(): string {
    return this.i18n.t('reservations.errors.notFound');
  }

  private getAuthenticatedClientId(user: ILoginUser): string {
    if (user.type !== UserTypeEnum.CLIENT || !user.client?.id) {
      throw new ForbiddenException(
        this.i18n.t('reservations.errors.clientAssociationRequired'),
      );
    }

    return user.client.id;
  }

  private getAuthenticatedProviderId(user: ILoginUser): string {
    if (user.type !== UserTypeEnum.PROVIDER) {
      throw new ForbiddenException(
        this.i18n.t('reservations.errors.providerAssociationRequired'),
      );
    }

    if (!user.providerAdmin?.providerId) {
      throw new ForbiddenException(
        this.i18n.t('reservations.errors.providerAssociationRequired'),
      );
    }

    return user.providerAdmin.providerId;
  }
}