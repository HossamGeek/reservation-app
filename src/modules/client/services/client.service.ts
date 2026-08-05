import {
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { BaseEntityService } from 'src/libs/base-service/base-entity.service';
import { DocumentEntityTypeEnum } from 'src/libs/enums/document-entity-type.enum';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { UserMapper } from 'src/libs/mappers/user.mapper';
import { CityService } from 'src/modules/city/city.service';
import { ClientTranslationMapper } from 'src/libs/mappers/client-translation.mapper';
import { DocumentService } from 'src/modules/document/document.service';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/user.service';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  Not,
  Raw,
  Repository,
} from 'typeorm';
import { CreateClientAddressDto } from '../dto/request/create-client-address.dto';
import { UpdateClientProfileDto } from '../dto/request/update-client-profile.dto';
import { ClientAddressEntity } from '../entities/client-address.entity';
import { ClientEntity } from '../entities/client.entity';
import { ClientResponseDto } from '../dto/response/client-response.dto';

@Injectable()
export class ClientService extends BaseEntityService<ClientEntity> {
  constructor(
    @InjectRepository(ClientEntity)
    repository: Repository<ClientEntity>,
    private readonly userService: UserService,
    private readonly cityService: CityService,
    private readonly documentService: DocumentService,
    @InjectRepository(ClientAddressEntity)
    private readonly clientAddressRepository: Repository<ClientAddressEntity>,
    private readonly dataSource: DataSource,
    i18n: I18nService,
  ) {
    super(repository, i18n);
  }

  async findProfile(clientId?: string): Promise<ClientResponseDto> {
    if (!clientId) {
      throw new NotFoundException(this.getNotFoundMessage());
    }

    const client = await this.findOneByOrFail({
      where: { id: clientId },
      relations: { user: true },
      select: {
        user: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    });

    return ClientTranslationMapper.toResponse(client);
  }

  async createAddress(
    createClientAddressDto: CreateClientAddressDto,
    user: ILoginUser,
  ): Promise<void> {
    if (user.type !== UserTypeEnum.CLIENT) {
      throw new ForbiddenException(
        this.i18n.t('client.address.errors.forbidden'),
      );
    }

    const clientId = user.client?.id;
    const cityName = createClientAddressDto.cityName.trim().toLowerCase();
    const city = await this.cityService.findOneBy({
      where: {
        nameEn: Raw((alias) => `LOWER(${alias}) = :cityName`, { cityName }),
        isActive: true,
      },
      select: { id: true },
    });

    if (!city) {
      throw new HttpException(
        this.i18n.t('client.address.errors.cityNotFound'),
        438,
      );
    }

    const addressCount = await this.clientAddressRepository.count({
      where: {
        clientId,
      },
    });

    const shouldBeDefault =
      addressCount === 0 || createClientAddressDto.isDefault;

    if (createClientAddressDto.isDefault) {
      await this.clientAddressRepository.update(
        { clientId, isDefault: true },
        { isDefault: false },
      );
    }

    const clientAddress = this.clientAddressRepository.create({
      latitude: String(createClientAddressDto.latitude),
      longitude: String(createClientAddressDto.longitude),
      fullAddress: createClientAddressDto.fullAddress,
      cityId: city.id,
      title: createClientAddressDto.title,
      buildingNumber: createClientAddressDto.buildingNumber,
      homeNumber: createClientAddressDto.homeNumber,
      phoneNumber: createClientAddressDto.phoneNumber,
      isDefault: shouldBeDefault,
      clientId,
    });

    await this.clientAddressRepository.save(clientAddress);
  }

  async updateProfile(
    updateClientProfileDto: UpdateClientProfileDto,
    user: ILoginUser,
  ): Promise<void> {
    const client = await this.findOneByOrFail({
      where: { user: { id: user.id, type: UserTypeEnum.CLIENT } },
      relations: { user: true },
    });

    const uniqueWhere: FindOptionsWhere<ClientEntity>[] = [];
    if (updateClientProfileDto.email) {
      uniqueWhere.push({
        user: {
          email: updateClientProfileDto.email,
          type: UserTypeEnum.CLIENT,
          id: Not(user.id),
        },
      });
    }
    if (updateClientProfileDto.phoneNumber) {
      uniqueWhere.push({
        user: {
          phoneNumber: updateClientProfileDto.phoneNumber,
          type: UserTypeEnum.CLIENT,
          id: Not(user.id),
        },
      });
    }
    if (updateClientProfileDto.nationalId) {
      uniqueWhere.push({
        nationalId: updateClientProfileDto.nationalId,
        userId: Not(user.id),
      });
    }

    if (uniqueWhere.length > 0) {
      const existingClient = await this.findOneBy({
        where: uniqueWhere,
        relations: { user: true },
      });

      if (existingClient?.user) {
        existingClient.user.client = existingClient;
        this.validateDuplicates(
          existingClient.user,
          updateClientProfileDto,
          UserMapper.duplicateFieldsMappingClient,
          'client.profile.errors.duplicate',
        );
      }
    }

    if (updateClientProfileDto.logoId) {
      await this.validateLogoDocument(updateClientProfileDto.logoId!);
    }

    await this.dataSource.transaction(async (entityManager) => {
      if (updateClientProfileDto.logoId) {
        await this.unassignOldLogo(client.user, entityManager);
        await this.assignNewLogo(
          updateClientProfileDto.logoId!,
          client.userId,
          entityManager,
        );
      }

      UserMapper.toUpdateClientProfile(updateClientProfileDto, client);
      await this.userService.updateClientProfile(
        client.user,
        updateClientProfileDto,
        entityManager,
      );
      await entityManager.save(client);
    });
  }

  private async validateLogoDocument(logoId: string): Promise<void> {
    const logoDocument = await this.documentService.findOneByOrFail({
      where: { id: logoId },
    });

    if (logoDocument.entityId || logoDocument.isUsed) {
      throw new UnprocessableEntityException(
        this.i18n.t('client.profile.errors.logoAlreadyUsed'),
      );
    }

    if (logoDocument.status !== DocumentStatusEnum.Pending) {
      throw new UnprocessableEntityException(
        this.i18n.t('client.profile.errors.invalidLogo'),
      );
    }
  }

  private async unassignOldLogo(
    clientUser: UserEntity,
    entityManager: EntityManager,
  ): Promise<void> {
    if (!clientUser.image) {
      return;
    }

    await this.documentService.unassignDocuments(
      [clientUser.image],
      entityManager,
    );
  }

  private async assignNewLogo(
    logoId: string,
    userId: string,
    entityManager: EntityManager,
  ): Promise<void> {
    await this.documentService.markAsUsed(
      [logoId],
      DocumentEntityTypeEnum.User,
      userId,
      entityManager,
    );
  }

  protected getNotFoundMessage(): string {
    return this.i18n.t('client.errors.notFound');
  }
}
