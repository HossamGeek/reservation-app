import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { TranslationDto } from 'src/libs/dto/translation.dto';
import { IsBigIntId } from 'src/libs/decorators/is-bigint-id.decorator';

export class CreateCityDto {
  @ApiProperty({
    description: 'The associated country ID of the city',
    example: 1,
  })
  @IsNotEmpty()
  @IsString()
  @IsBigIntId()
  countryId: string;

  @IsNotEmpty()
  @ApiProperty({
    description:
      'The name of the city containing English and Arabic translations',
    type: () => TranslationDto,
  })
  @ValidateNested()
  @Type(() => TranslationDto)
  name: TranslationDto;
}
