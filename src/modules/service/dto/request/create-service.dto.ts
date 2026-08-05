import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { IsBigIntId } from 'src/libs/decorators/is-bigint-id.decorator';
import { TranslationDto } from 'src/libs/dto/translation.dto';

export class CreateServiceDto {
  @ApiProperty({ type: String, example: '1' })
  @IsBigIntId()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ type: String, example: '5' })
  @IsBigIntId()
  @IsNotEmpty()
  serviceTypeId: string;

  @ApiPropertyOptional({ type: String, example: '2' })
  @IsOptional()
  @IsBigIntId()
  logoId?: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The service name containing English and Arabic translations',
    type: () => TranslationDto,
  })
  @ValidateNested()
  @Type(() => TranslationDto)
  name: TranslationDto;

  @IsNotEmpty()
  @ApiProperty({
    description:
      'The service description containing English and Arabic translations',
    type: () => TranslationDto,
  })
  @ValidateNested()
  @Type(() => TranslationDto)
  description: TranslationDto;
}
