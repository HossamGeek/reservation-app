import { IsNotEmpty, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TranslationDto } from 'src/libs/dto/translation.dto';

export class CreatePositionDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the position containing English and Arabic translations',
    type: () => TranslationDto,
  })
  @ValidateNested()
  @Type(() => TranslationDto)
  name: TranslationDto;
}
