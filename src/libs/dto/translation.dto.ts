import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TranslationDto {
  @ApiProperty({
    description: 'English translation',
    example: 'text',
    maxLength: 255,
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, {
    message: 'en translation must be at least 1 character long',
  })
  @MaxLength(255, {
    message: 'en translation must not exceed 255 characters',
  })
  en: string;

  @ApiProperty({
    description: 'Arabic translation',
    example: 'نص',
    maxLength: 255,
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1, {
    message: 'ar translation must be at least 1 character long',
  })
  @MaxLength(255, {
    message: 'ar translation must not exceed 255 characters',
  })
  ar: string;
}
