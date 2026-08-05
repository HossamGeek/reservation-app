import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsIn, IsNotEmpty, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";
import { DocumentStatusEnum } from "src/libs/enums/document-status.enum";

export class ReviewDocumentDto {
  @ApiProperty({ enum: [ DocumentStatusEnum.Approved, DocumentStatusEnum.Rejected ] })
  @IsEnum(DocumentStatusEnum)
  @IsNotEmpty()
  @IsIn([ DocumentStatusEnum.Approved, DocumentStatusEnum.Rejected ])
  status: DocumentStatusEnum;

  @ApiPropertyOptional({
    minLength: 5,
    maxLength: 500,
  })
  @ValidateIf((dto) => dto.status === DocumentStatusEnum.Rejected)
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  rejectionReason?: string;
}