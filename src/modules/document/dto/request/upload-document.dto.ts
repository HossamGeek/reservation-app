import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentEntityTypeEnum } from 'src/libs/enums/document-entity-type.enum';
import { IsBigIntId } from 'src/libs/decorators/is-bigint-id.decorator';

export class UploadDocumentDto {
  @ApiPropertyOptional({ enum: DocumentEntityTypeEnum })
  @IsOptional()
  @IsEnum(DocumentEntityTypeEnum)
  entityType?: DocumentEntityTypeEnum;

  @ApiPropertyOptional({ description: 'Target entity ID' })
  @IsOptional()
  @IsString()
  @IsBigIntId()
  entityId?: string;
}
