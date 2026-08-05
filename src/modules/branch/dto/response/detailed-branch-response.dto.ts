import { OmitType } from '@nestjs/swagger';
import { TranslationDto } from 'src/libs/dto/translation.dto';
import { BranchResponseDto } from './branch-response.dto';

export class DetailedBranchResponseDto extends OmitType(BranchResponseDto, [
  'name',
  'address',
]) {
  name: TranslationDto;
  address: TranslationDto;
}
