import {
  ForbiddenException,
  HttpException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { ClientService } from 'src/modules/client/services/client.service';
import { ClientAddressEntity } from 'src/modules/client/entities/client-address.entity';
import { ClientEntity } from 'src/modules/client/entities/client.entity';
import { DocumentEntityTypeEnum } from 'src/libs/enums/document-entity-type.enum';
import { DocumentStatusEnum } from 'src/libs/enums/document-status.enum';
import { UserStatusEnum } from 'src/libs/enums/user-status.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { CityService } from 'src/modules/city/city.service';
import { CreateClientAddressDto } from 'src/modules/client/dto/request/create-client-address.dto';
import { UpdateClientProfileDto } from 'src/modules/client/dto/request/update-client-profile.dto';
import { DocumentService } from 'src/modules/document/document.service';
import { UserService } from 'src/modules/user/user.service';
import { DataSource } from 'typeorm';

describe('ClientService', () => {
  let service: ClientService;
  let cityService: CityService;

  const mockClientRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockClientAddressRepository = {
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockCityService = {
    findOneBy: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  const clientUser: ILoginUser = {
    id: 'user-7',
    phoneNumber: '+966500000000',
    type: UserTypeEnum.CLIENT,
    status: UserStatusEnum.ACTIVE,
    client: { id: '42' } as ILoginUser['client'],
    role: null,
  };

  const nonClientUser: ILoginUser = {
    id: '1',
    phoneNumber: '+966500000001',
    type: UserTypeEnum.ADMIN,
    status: UserStatusEnum.ACTIVE,
    role: null,
  };

  const baseDto: CreateClientAddressDto = {
    latitude: 24.7135517,
    longitude: 46.6752957,
    fullAddress: 'King Fahd Road, Riyadh',
    cityName: 'Riyadh',
    title: 'Home',
    buildingNumber: '12B',
    homeNumber: '24',
    phoneNumber: '+966504545432',
    isDefault: false,
  };

  const userService = {
    updateClientProfile: jest.fn(),
  };
  const documentService = {
    findOneByOrFail: jest.fn(),
    unassignDocuments: jest.fn(),
    markAsUsed: jest.fn(),
  };

  const entityManager = {
    save: jest.fn(),
  };
  const dataSource = {
    transaction: jest.fn((callback) => callback(entityManager)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: getRepositoryToken(ClientEntity),
          useValue: mockClientRepository,
        },
        {
          provide: getRepositoryToken(ClientAddressEntity),
          useValue: mockClientAddressRepository,
        },
        {
          provide: getRepositoryToken(ClientEntity),
          useValue: mockClientRepository,
        },
        { provide: UserService, useValue: userService },
        { provide: CityService, useValue: mockCityService },
        { provide: DocumentService, useValue: documentService },
        { provide: DataSource, useValue: dataSource },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get(ClientService);
    cityService = module.get(CityService);
    jest.clearAllMocks();
  });

  describe('createAddress', () => {
    it('should throw ForbiddenException when user is not a client', async () => {
      await expect(
        service.createAddress(baseDto, nonClientUser),
      ).rejects.toThrow(
        new ForbiddenException('client.address.errors.forbidden'),
      );

      expect(cityService.findOneBy).not.toHaveBeenCalled();
      expect(mockClientAddressRepository.count).not.toHaveBeenCalled();
      expect(mockClientAddressRepository.create).not.toHaveBeenCalled();
      expect(mockClientAddressRepository.save).not.toHaveBeenCalled();
    });

    it('should throw HttpException(438) when city is not found', async () => {
      mockCityService.findOneBy.mockResolvedValue(null);

      await expect(service.createAddress(baseDto, clientUser)).rejects.toThrow(
        new HttpException('client.address.errors.cityNotFound', 438),
      );

      expect(mockClientAddressRepository.count).not.toHaveBeenCalled();
      expect(mockClientAddressRepository.create).not.toHaveBeenCalled();
      expect(mockClientAddressRepository.save).not.toHaveBeenCalled();
    });

    it('should set first address as default and skip update when addressCount is 0 and isDefault is false', async () => {
      mockCityService.findOneBy.mockResolvedValue({ id: '5' });
      mockClientAddressRepository.count.mockResolvedValue(0);
      const createdEntity = { id: '10', clientId: '42', isDefault: true };
      mockClientAddressRepository.create.mockReturnValue(createdEntity);
      mockClientAddressRepository.save.mockResolvedValue(createdEntity);

      await service.createAddress(baseDto, clientUser);

      expect(cityService.findOneBy).toHaveBeenCalledWith({
        where: {
          nameEn: expect.any(Object),
          isActive: true,
        },
        select: { id: true },
      });
      expect(mockClientAddressRepository.count).toHaveBeenCalledWith({
        where: { clientId: '42' },
      });
      expect(mockClientAddressRepository.update).not.toHaveBeenCalled();
      expect(mockClientAddressRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isDefault: true, clientId: '42' }),
      );
      expect(mockClientAddressRepository.save).toHaveBeenCalledWith(
        createdEntity,
      );
    });

    it('should reset previous default via update when explicit isDefault is true and addresses exist', async () => {
      mockCityService.findOneBy.mockResolvedValue({ id: '5' });
      mockClientAddressRepository.count.mockResolvedValue(3);
      const dtoWithDefault = { ...baseDto, isDefault: true };
      const createdEntity = { id: '11', clientId: '42', isDefault: true };
      mockClientAddressRepository.create.mockReturnValue(createdEntity);
      mockClientAddressRepository.save.mockResolvedValue(createdEntity);

      await service.createAddress(dtoWithDefault, clientUser);

      expect(mockClientAddressRepository.update).toHaveBeenCalledWith(
        { clientId: '42', isDefault: true },
        { isDefault: false },
      );
      expect(mockClientAddressRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isDefault: true, clientId: '42' }),
      );
      expect(mockClientAddressRepository.save).toHaveBeenCalledWith(
        createdEntity,
      );
    });

    it('should not call update when isDefault is false and addressCount > 0', async () => {
      mockCityService.findOneBy.mockResolvedValue({ id: '5' });
      mockClientAddressRepository.count.mockResolvedValue(3);
      const createdEntity = { id: '12', clientId: '42', isDefault: false };
      mockClientAddressRepository.create.mockReturnValue(createdEntity);
      mockClientAddressRepository.save.mockResolvedValue(createdEntity);

      await service.createAddress(baseDto, clientUser);

      expect(mockClientAddressRepository.update).not.toHaveBeenCalled();
      expect(mockClientAddressRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isDefault: false, clientId: '42' }),
      );
      expect(mockClientAddressRepository.save).toHaveBeenCalledWith(
        createdEntity,
      );
    });
  });

  describe('findProfile', () => {
    it('should throw NotFoundException without querying when client ID is missing', async () => {
      const findOneByOrFailSpy = jest.spyOn(service, 'findOneByOrFail');

      await expect(service.findProfile(undefined)).rejects.toThrow(
        new NotFoundException('client.errors.notFound'),
      );

      expect(findOneByOrFailSpy).not.toHaveBeenCalled();
      expect(mockClientRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when client is not found', async () => {
      mockClientRepository.findOne.mockResolvedValue(null);

      await expect(service.findProfile('42')).rejects.toThrow(
        new NotFoundException('client.errors.notFound'),
      );

      expect(mockClientRepository.findOne).toHaveBeenCalledWith({
        where: { id: '42' },
        relations: { user: true },
        select: {
          user: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      });
    });

    it('should return mapped client profile data', async () => {
      mockClientRepository.findOne.mockResolvedValue({
        id: '42',
        user: {
          firstName: 'Ahmed',
          lastName: 'Ali',
          email: null,
          image: 'https://example.com/logo.png',
        },
      });

      await expect(service.findProfile('42')).resolves.toEqual({
        id: '42',
        logo: 'https://example.com/logo.png',
        firstName: 'Ahmed',
        lastName: 'Ali',
        nationalId: null,
        email: null,
      });
    });
  });

  describe('updateProfile', () => {
    const profileDto: UpdateClientProfileDto = {
      firstName: 'Ahmed',
      lastName: 'Hassan',
      phoneNumber: '+966511111111',
      email: 'ahmed@ERP.com',
      logoId: '42',
    };

    const createExistingUser = () => ({
      id: 'user-7',
      firstName: 'Old',
      lastName: 'Name',
      phoneNumber: '+966500000000',
      email: null as string | null,
      image: null as string | null,
    });

    const createExistingClient = (user = createExistingUser()) => ({
      id: '42',
      userId: 'user-7',
      nationalId: null as string | null,
      user,
    });

    const loadClientOptions = {
      where: { user: { id: 'user-7', type: UserTypeEnum.CLIENT } },
      relations: { user: true },
    };

    beforeEach(() => {
      const existingClient = createExistingClient();
      mockClientRepository.findOne
        .mockResolvedValueOnce(existingClient)
        .mockResolvedValueOnce(null);
      userService.updateClientProfile.mockResolvedValue(existingClient.user);
      entityManager.save.mockResolvedValue(existingClient);
      documentService.findOneByOrFail.mockResolvedValue({
        id: '42',
        isUsed: false,
        entityId: null,
        status: DocumentStatusEnum.Pending,
      });
      documentService.unassignDocuments.mockResolvedValue(undefined);
      documentService.markAsUsed.mockResolvedValue(undefined);
    });

    it('maps profile fields, assigns logo, and saves in a transaction', async () => {
      await service.updateProfile(profileDto, clientUser);

      expect(mockClientRepository.findOne).toHaveBeenNthCalledWith(
        1,
        loadClientOptions,
      );
      expect(mockClientRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: [
          {
            user: {
              email: 'ahmed@ERP.com',
              type: UserTypeEnum.CLIENT,
              id: expect.anything(),
            },
          },
          {
            user: {
              phoneNumber: '+966511111111',
              type: UserTypeEnum.CLIENT,
              id: expect.anything(),
            },
          },
        ],
        relations: { user: true },
      });
      expect(documentService.findOneByOrFail).toHaveBeenCalledWith({
        where: { id: '42' },
      });
      expect(documentService.unassignDocuments).not.toHaveBeenCalled();
      expect(documentService.markAsUsed).toHaveBeenCalledWith(
        ['42'],
        DocumentEntityTypeEnum.User,
        'user-7',
        entityManager,
      );
      expect(userService.updateClientProfile).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-7' }),
        profileDto,
        entityManager,
      );
      expect(entityManager.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: '42', userId: 'user-7' }),
      );
    });

    it('unassigns the previous logo when replacing it', async () => {
      const existingClient = createExistingClient({
        ...createExistingUser(),
        image: '10',
      });
      mockClientRepository.findOne.mockReset();
      mockClientRepository.findOne
        .mockResolvedValueOnce(existingClient)
        .mockResolvedValueOnce(null);

      await service.updateProfile(profileDto, clientUser);

      expect(documentService.unassignDocuments).toHaveBeenCalledWith(
        ['10'],
        entityManager,
      );
      expect(documentService.markAsUsed).toHaveBeenCalledWith(
        ['42'],
        DocumentEntityTypeEnum.User,
        'user-7',
        entityManager,
      );
    });

    it('skips logo document handling when logoId is not provided', async () => {
      await service.updateProfile(
        { ...profileDto, logoId: undefined },
        clientUser,
      );

      expect(documentService.findOneByOrFail).not.toHaveBeenCalled();
      expect(documentService.unassignDocuments).not.toHaveBeenCalled();
      expect(documentService.markAsUsed).not.toHaveBeenCalled();
      expect(userService.updateClientProfile).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-7' }),
        { ...profileDto, logoId: undefined },
        entityManager,
      );
      expect(entityManager.save).toHaveBeenCalled();
    });

    it('skips duplicate lookup and logo handling when only names are provided', async () => {
      const namesOnlyDto = { firstName: 'Ahmed', lastName: 'Hassan' };
      mockClientRepository.findOne.mockReset();
      mockClientRepository.findOne.mockResolvedValueOnce(createExistingClient());

      await service.updateProfile(namesOnlyDto, clientUser);

      expect(mockClientRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockClientRepository.findOne).toHaveBeenCalledWith(
        loadClientOptions,
      );
      expect(documentService.findOneByOrFail).not.toHaveBeenCalled();
      expect(userService.updateClientProfile).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-7' }),
        namesOnlyDto,
        entityManager,
      );
    });

    it('rejects non-client users', async () => {
      mockClientRepository.findOne.mockReset();
      mockClientRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.updateProfile(profileDto, {
          ...clientUser,
          type: UserTypeEnum.PROVIDER,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockClientRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 'user-7', type: UserTypeEnum.CLIENT } },
        relations: { user: true },
      });
      expect(userService.updateClientProfile).not.toHaveBeenCalled();
    });

    it('throws when email or phone already belongs to another user', async () => {
      const existingClient = createExistingClient();
      const conflictingClient = {
        id: '99',
        userId: 'other-user',
        nationalId: null,
        user: {
          id: 'other-user',
          email: 'ahmed@ERP.com',
          phoneNumber: '+966599999999',
        },
      };
      mockClientRepository.findOne.mockReset();
      mockClientRepository.findOne
        .mockResolvedValueOnce(existingClient)
        .mockResolvedValueOnce(conflictingClient);

      await expect(
        service.updateProfile(profileDto, clientUser),
      ).rejects.toThrow(UnprocessableEntityException);

      expect(userService.updateClientProfile).not.toHaveBeenCalled();
      expect(entityManager.save).not.toHaveBeenCalled();
    });

    it('throws when logo document is already used', async () => {
      documentService.findOneByOrFail.mockResolvedValueOnce({
        id: '42',
        isUsed: true,
        entityId: 'other-user',
        status: DocumentStatusEnum.Pending,
      });

      await expect(
        service.updateProfile(profileDto, clientUser),
      ).rejects.toThrow(UnprocessableEntityException);

      expect(documentService.markAsUsed).not.toHaveBeenCalled();
      expect(userService.updateClientProfile).not.toHaveBeenCalled();
    });

    it('throws when logo document is not pending', async () => {
      documentService.findOneByOrFail.mockResolvedValueOnce({
        id: '42',
        isUsed: false,
        entityId: null,
        status: DocumentStatusEnum.Approved,
      });

      await expect(
        service.updateProfile(profileDto, clientUser),
      ).rejects.toThrow(UnprocessableEntityException);

      expect(documentService.markAsUsed).not.toHaveBeenCalled();
    });
  });
});
