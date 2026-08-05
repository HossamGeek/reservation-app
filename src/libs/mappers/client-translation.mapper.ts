import { ClientEntity } from 'src/modules/client/entities/client.entity';
import { ClientResponseDto } from 'src/modules/client/dto/response/client-response.dto';

export class ClientTranslationMapper {
  static toResponse(entity: ClientEntity): ClientResponseDto {
    return {
      id: entity.id,
      logo: 'https://example.com/logo.png',
      firstName: entity.user.firstName,
      lastName: entity.user.lastName,
      nationalId: entity.nationalId ?? null,
      email: entity.user.email ?? null,
    };
  }
}
