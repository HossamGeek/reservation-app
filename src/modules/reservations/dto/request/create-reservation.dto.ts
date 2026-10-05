import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsBigIntId } from 'src/libs/decorators/is-bigint-id.decorator';
import { IsNotPastDate } from 'src/libs/decorators/is-not-past-date.decorator';

export class CreateReservationDto {
  @ApiProperty({ example: '1' })
  @IsBigIntId()
  providerId: string;

  @ApiProperty({ example: '1' })
  @IsBigIntId()
  serviceId: string;

  @ApiProperty({ example: '1' })
  @IsBigIntId()
  shiftId: string;

  @ApiProperty({
    example: '2026-09-10',
    description: 'YYYY-MM-DD, today or later',
  })
  @IsNotEmpty()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsNotPastDate()
  date: string;

  @ApiPropertyOptional({
    example: 'Please prepare the service in advance and confirm the booking details.',
    description: 'Optional notes (1-500 characters)',
    minLength: 1,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  notes?: string;
}