import { DuplicateFieldMapping } from 'src/libs/base-service/interfaces/duplicate-validation.interface';
import {
  BaseSignInResponseDto,
  SignInResponseDto,
} from 'src/modules/auth/dto/respose/sign-in-user.response.dto';
import { UpdateClientProfileDto } from 'src/modules/client/dto/request/update-client-profile.dto';
import { ClientEntity } from 'src/modules/client/entities/client.entity';
import { CreateProviderOwnerDto } from '../../modules/provider/dto/request/create-provider-owner.dto';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { UserTypeEnum } from '../enums/user-type.enum';

export class UserMapper {
  static readonly duplicateFieldsMapping: DuplicateFieldMapping<
    UserEntity,
    CreateProviderOwnerDto | UpdateClientProfileDto
  >[] = [
    { entityField: 'email', dtoField: 'email' },
    { entityField: 'phoneNumber', dtoField: 'phoneNumber' },
  ];

  static readonly duplicateFieldsMappingClient: DuplicateFieldMapping<
    UserEntity,
    UpdateClientProfileDto
  >[] = [
    { entityField: 'email', dtoField: 'email' },
    { entityField: 'phoneNumber', dtoField: 'phoneNumber' },
    { entityField: (user) => user.client?.nationalId, dtoField: 'nationalId' },
  ];

  static toResponse(user: UserEntity): SignInResponseDto['user'] {
    const baseResponse: BaseSignInResponseDto = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      type: user.type,
      status: user.status,
      phoneNumber: user.phoneNumber,
      // TODO: Replace later with the actual verification status from the database
      isVerified: true,
      createdAt: user.createdAt,
    };

    switch (user.type) {
      case UserTypeEnum.CLIENT:
        return {
          ...baseResponse,
          address: user.client?.addresses?.find(
            (address) => address.isDefault,
          )?.fullAddress  ?? null,
        }
      case UserTypeEnum.WORKER:
        return baseResponse;

      case UserTypeEnum.PROVIDER:
        return {
          ...baseResponse,
          image: user.image,
          providerId: user.providerAdmin?.providerId,
          role: user.role,
        };
      case UserTypeEnum.ADMIN:
        return {
          ...baseResponse,
          image: user.image,
          role: user.role,
        };

      default:
        throw new Error(`Unsupported user type: ${user.type}`);
    }
  }

  static toUpdateUser(dto: UpdateClientProfileDto, user: UserEntity): void {
    if (dto.firstName) {user.firstName = dto.firstName;}
    if (dto.lastName) {user.lastName = dto.lastName;}
    if (dto.phoneNumber) {user.phoneNumber = dto.phoneNumber;}
    if (dto.email) {user.email = dto.email;}
    if (dto.logoId) {user.image = dto.logoId;}
  }

  static toUpdateClientProfile(
    dto: UpdateClientProfileDto,
    client: ClientEntity,
  ): void {
    if (dto.nationalId) {
      client.nationalId = dto.nationalId;
    }
  }
}
