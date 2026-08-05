import { DocumentResponseDto } from 'src/modules/document/dto/response/document-response.dto';
import { DocumentEntity } from 'src/modules/document/entities/document.entity';

export class DocumentTranslationMapper {
  static toResponse(entity: DocumentEntity): DocumentResponseDto {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      fullUrl: `${entity.fullUrl()}`,
      originalFileName: entity.originalFileName,
      rejectionReason: entity.rejectionReason,
      status: entity.status,
      verifiedBy: entity.verifiedBy
        ? `${entity.verifiedBy.firstName} ${entity.verifiedBy.lastName}`
        : null,
      updatedAt: entity.updatedAt ?? null,
    };
  }

  static toResponses(
    entities: (DocumentEntity | null | undefined)[],
  ): DocumentResponseDto[] {
    return (entities ?? [])
      .filter((entity): entity is DocumentEntity => !!entity)
      .map((entity) => this.toResponse(entity));
  }
}
