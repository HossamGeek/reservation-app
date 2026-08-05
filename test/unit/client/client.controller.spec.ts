import { Test, TestingModule } from '@nestjs/testing';
import { RequestMethod } from '@nestjs/common';
import {
  HTTP_CODE_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { I18nService } from 'nestjs-i18n';
import { ApiResponse } from 'src/libs/errors/api-response';
import { UserStatusEnum } from 'src/libs/enums/user-status.enum';
import { UserTypeEnum } from 'src/libs/enums/user-type.enum';
import { ILoginUser } from 'src/libs/interfaces/user-request.interface';
import { ClientController } from 'src/modules/client/controllers/client.controller';
import { CreateClientAddressDto } from 'src/modules/client/dto/request/create-client-address.dto';
import { UpdateClientProfileDto } from 'src/modules/client/dto/request/update-client-profile.dto';
import { ClientService } from 'src/modules/client/services/client.service';

describe('ClientController', () => {
  let controller: ClientController;

  const mockClientService = {
    findProfile: jest.fn(),
    createAddress: jest.fn(),
    updateProfile: jest.fn(),
  };
  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  const dto: CreateClientAddressDto = {
    latitude: 24.7135517,
    longitude: 46.6752957,
    fullAddress: 'King Fahd Road, Riyadh',
    cityName: 'Riyadh',
    title: 'Home',
    buildingNumber: '12B',
    homeNumber: '24',
    phoneNumber: '+966504545432',
    isDefault: true,
  };
  const user: ILoginUser = {
    id: '7',
    phoneNumber: '+966500000000',
    type: UserTypeEnum.CLIENT,
    status: UserStatusEnum.ACTIVE,
    client: { id: '42' } as ILoginUser['client'],
    role: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        { provide: ClientService, useValue: mockClientService },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    controller = module.get(ClientController);
    jest.clearAllMocks();
  });

  it('creates address for current user and returns default success response', async () => {
    mockClientService.createAddress.mockResolvedValue(undefined);

    const result = await controller.createAddress(dto, user);

    expect(mockClientService.createAddress).toHaveBeenCalledWith(dto, user);
    expect(result).toEqual(
      ApiResponse.successResponse('client.address.create.success'),
    );
  });

  it('finds current client profile and returns success response with data', async () => {
    const profile = {
      id: '42',
      logo: null,
      firstName: 'Ahmed',
      lastName: 'Ali',
      nationalityId: '4566878442342368746',
      email: 'ahmed@example.com',
    };
    mockClientService.findProfile.mockResolvedValue(profile);

    const result = await controller.findProfile(user);

    expect(mockClientService.findProfile).toHaveBeenCalledWith('42');
    expect(mockI18n.t).toHaveBeenCalledWith('client.profile.get.success');
    expect(result).toEqual(
      ApiResponse.successResponse('client.profile.get.success', {
        data: profile,
      }),
    );
  });

  it('passes undefined client ID when authenticated user has no client relation', async () => {
    mockClientService.findProfile.mockResolvedValue({});

    await controller.findProfile({ ...user, client: null });

    expect(mockClientService.findProfile).toHaveBeenCalledWith(undefined);
  });

  it('exposes POST /client/address with 200 status code', () => {
    expect(Reflect.getMetadata(PATH_METADATA, ClientController)).toBe('client');
    expect(Reflect.getMetadata(PATH_METADATA, controller.createAddress)).toBe(
      'address',
    );
    expect(Reflect.getMetadata(METHOD_METADATA, controller.createAddress)).toBe(
      RequestMethod.POST,
    );
    expect(
      Reflect.getMetadata(HTTP_CODE_METADATA, controller.createAddress),
    ).toBe(200);
  });

  it('exposes GET /client/me', () => {
    expect(Reflect.getMetadata(PATH_METADATA, controller.findProfile)).toBe(
      'me',
    );
    expect(Reflect.getMetadata(METHOD_METADATA, controller.findProfile)).toBe(
      RequestMethod.GET,
      );
  });
  
  it('updates profile for current user and returns success response', async () => {
    const profileDto: UpdateClientProfileDto = {
      firstName: 'Ahmed',
      lastName: 'Hassan',
    };
    mockClientService.updateProfile.mockResolvedValue(undefined);

    const result = await controller.updateProfile(profileDto, user);

    expect(mockClientService.updateProfile).toHaveBeenCalledWith(
      profileDto,
      user,
    );
    expect(result).toEqual(
      ApiResponse.successResponse('client.profile.update.success'),
    );
  });
});
