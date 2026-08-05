import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { IsBigIntId } from 'src/libs/decorators/is-bigint-id.decorator';
import { TranslationDto } from 'src/libs/dto/translation.dto';

export class CreateCategoryDto {
  @IsNotEmpty()
  @ApiProperty({
    description:
      'The name of the position containing English and Arabic translations',
    type: () => TranslationDto,
  })
  @ValidateNested()
  @Type(() => TranslationDto)
  name: TranslationDto;

  @IsNotEmpty()
  @ApiProperty({
    description:
      'The description of the category containing English and Arabic translations',
    type: () => TranslationDto,
  })
  @ValidateNested()
  @Type(() => TranslationDto)
  description: TranslationDto;

  @ApiProperty({
    description: 'Optionally logo id',
    type: BigInt,
    required: false,
  })
  @IsOptional()
  @IsBigIntId()
  logoId: string;
}
