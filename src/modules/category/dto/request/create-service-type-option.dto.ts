import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested} from 'class-validator';
import { TranslationDto } from 'src/libs/dto/translation.dto';
import { IsBigIntId } from 'src/libs/decorators/is-bigint-id.decorator';

export class CreateServiceTypeOptionDto {
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
    description: 'The ID of the service type to which this option belongs',
    type: String,
  })
  @IsString()
  @IsBigIntId()
  serviceTypeId: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the service type to which this option belongs',
    type: String,
  })  
  @IsBigIntId()
  @IsString()
  logoId: string;

  
  @ApiProperty({
    description:
      'The description of the position containing English and Arabic translations',
    type: () => TranslationDto,
  })
  @ValidateNested()
  @Type(() => TranslationDto)
  description: TranslationDto;

}
