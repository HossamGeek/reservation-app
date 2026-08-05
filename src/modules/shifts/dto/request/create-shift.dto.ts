import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsBigIntId } from 'src/libs/decorators/is-bigint-id.decorator';

export class CreateShiftDto {
  @ApiProperty({
    description: 'The associated provider ID of the shift',
    type: String,
    example: '1',
  })
  @IsNotEmpty()
  @IsString()
  @IsBigIntId()
  providerId: string;

  @ApiProperty({
    description: 'The name of the shift',
    type: String,
    example: 'Morning Shift',
    maxLength: 255,
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @MinLength(1)
  name: string;

  @ApiProperty({
    description: 'The start time of the shift in 24-hour format (HH) 1 - 24',
    type: Number,
    example: 9,
    maximum: 24,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Max(24)
  @Min(1)
  fromHour: number;

  @ApiProperty({
    description: 'The end time of the shift in 24-hour format (HH) 1 - 24',
    type: Number,
    example: 17,
    maximum: 24,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Max(24)
  @Min(1)
  toHour: number;
}
