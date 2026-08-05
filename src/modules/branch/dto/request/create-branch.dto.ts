import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TranslationDto } from 'src/libs/dto/translation.dto';
import { IsBigIntId } from 'src/libs/decorators/is-bigint-id.decorator';

export class CreateBranchDto {
  @ApiProperty({
    type: TranslationDto,
    example: {
      ar: 'اسم الفرع',
      en: 'Branch name',
    },
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TranslationDto)
  name: TranslationDto;

  @ApiProperty({
    type: TranslationDto,
    example: {
      ar: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
      en: 'King Fahd Road, Riyadh, Saudi Arabia',
    },
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TranslationDto)
  address: TranslationDto;

  @ApiProperty({
    description: 'City Id',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  @IsBigIntId()
  cityId: string;

  @ApiProperty({
    description: 'Logo Id',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  @IsBigIntId()
  logoId: string;
}
