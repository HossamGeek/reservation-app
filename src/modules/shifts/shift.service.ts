import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { BaseEntityFinderService } from 'src/libs/base-service/base-entity-finder.service';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { ShiftTranslationMapper } from 'src/libs/mappers/shift-translation.mapper';
import { getProviderShiftsPaginationConfig } from 'src/libs/pagination/provider-shifts.pagination';
import { Repository } from 'typeorm';
import { ProviderService } from '../provider/provider.service';
import { CreateShiftDto } from './dto/request/create-shift.dto';
import { UpdateShiftDto } from './dto/request/update-shift.dto';
import { ProviderShiftResponseDto } from './dto/response/provider-shift-response.dto';
import { ShiftEntity } from './entities/shift.entity';

@Injectable()
export class ShiftService extends BaseEntityFinderService<ShiftEntity> {
  constructor(
    @InjectRepository(ShiftEntity)
    repository: Repository<ShiftEntity>,
    i18n: I18nService,
    private readonly providerService: ProviderService,
  ) {
    super(repository, i18n);
  }

  async create(createShiftDto: CreateShiftDto): Promise<void> {
    await this.validateShiftCreation(createShiftDto);
    const shiftEntity = this.repository.create(createShiftDto);
    await this.repository.save(shiftEntity);
  }

  async findAll(
    query: PaginateQuery,
    user: ILoginUser,
  ): Promise<Paginated<ProviderShiftResponseDto>> {
    const providerId = this.getAuthenticatedProviderId(user);

    const queryBuilder = this.repository
      .createQueryBuilder('shift')
      .where('shift.providerId = :providerId', { providerId });

    const result = await paginate(
      query,
      queryBuilder,
      getProviderShiftsPaginationConfig,
    );

    return {
      ...result,
      data: ShiftTranslationMapper.toResponses(result.data),
    } as Paginated<ProviderShiftResponseDto>;
  }

  async update(id: string, updateShiftDto: UpdateShiftDto): Promise<void> {
    const shift = await this.findOneByOrFail({
      where: { id },
    });

    if (updateShiftDto.name) {
      await this.validateShiftNameUniqueness(
        shift.providerId,
        updateShiftDto.name,
        id,
      );
      shift.name = updateShiftDto.name;
    }

    if (
      updateShiftDto.fromHour !== undefined ||
      updateShiftDto.toHour !== undefined
    ) {
      this.validateShiftTimeBoundariesForUpdate(shift, updateShiftDto);
      if (updateShiftDto.fromHour !== undefined) {
        shift.fromHour = updateShiftDto.fromHour;
      }
      if (updateShiftDto.toHour !== undefined) {
        shift.toHour = updateShiftDto.toHour;
      }
    }

    await this.repository.save(shift);
  }

  async updateStatus(id: string, isActive: boolean): Promise<void> {
    const shift = await this.findOneByOrFail({
      where: { id },
    });

    shift.isActive = isActive;
    await this.repository.save(shift);
  }

  private async validateShiftCreation(
    createShiftDto: CreateShiftDto,
  ): Promise<void> {
    this.validateShiftTimeBoundaries(createShiftDto);
    await this.validateProviderExistence(createShiftDto);
    await this.validateShiftNameUniqueness(
      createShiftDto.providerId,
      createShiftDto.name,
    );
  }

  private async validateProviderExistence(
    createShiftDto: CreateShiftDto,
  ): Promise<void> {
    await this.providerService.findOneByOrFail({
      where: { id: createShiftDto.providerId },
    });
  }

  private getAuthenticatedProviderId(user: ILoginUser): string {
    if (user.type !== UserTypeEnum.PROVIDER) {
      throw new ForbiddenException(
        this.i18n.t('shifts.errors.providerAssociationRequired'),
      );
    }

    if (!user.providerAdmin?.providerId) {
      throw new ForbiddenException(
        this.i18n.t('shifts.errors.providerAssociationRequired'),
      );
    }

    return user.providerAdmin?.providerId;
  }

  private validateHours(fromHour: number, toHour: number): void {
    if (fromHour >= toHour) {
      throw new UnprocessableEntityException(
        this.i18n.t('shifts.errors.invalidTimeRange'),
      );
    }
  }

  private validateShiftTimeBoundaries(createShiftDto: CreateShiftDto): void {
    this.validateHours(createShiftDto.fromHour, createShiftDto.toHour);
  }

  private validateShiftTimeBoundariesForUpdate(
    shift: ShiftEntity,
    updateShiftDto: UpdateShiftDto,
  ): void {
    const fromHour =
      updateShiftDto.fromHour !== undefined
        ? updateShiftDto.fromHour
        : shift.fromHour;
    const toHour =
      updateShiftDto.toHour !== undefined
        ? updateShiftDto.toHour
        : shift.toHour;

    this.validateHours(fromHour, toHour);
  }

  private async validateShiftNameUniqueness(
    providerId: string,
    name: string,
    excludeShiftId?: string,
  ): Promise<void> {
    const existingShift = await this.findOneBy({
      where: {
        providerId,
        name,
      },
    });
    if (
      existingShift &&
      (!excludeShiftId || existingShift.id !== excludeShiftId)
    ) {
      throw new UnprocessableEntityException(
        this.i18n.t('shifts.errors.duplicateShiftName'),
      );
    }
  }
  protected getNotFoundMessage(): string {
    return this.i18n.t('shifts.errors.notFound');
  }
}
