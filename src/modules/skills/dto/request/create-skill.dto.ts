import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { TranslationDto } from 'src/libs/dto/translation.dto';

export class CreateSkillDto {
 @IsNotEmpty()
   @ApiProperty({
     description: 'The name of the skills containing English and Arabic translations',
     type: () => TranslationDto,
   })
   @ValidateNested()
   @Type(() => TranslationDto)
   name!: TranslationDto;
}
