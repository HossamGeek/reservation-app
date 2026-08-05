import { IsBoolean, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TranslationDto } from 'src/libs/dto/translation.dto';

export class CreateNationalityDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the nationality containing English and Arabic translations',
    type: () => TranslationDto,
  })
  @ValidateNested()
  @Type(() => TranslationDto)
  name: TranslationDto;

  @ApiProperty({
    description: 'The active status of the nationality',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
