import { IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExperienceDto {
  @ApiProperty({
    description: 'Minimum years of experience',
    example: 2,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  minYears: number;

  @ApiProperty({
    description: 'Maximum years of experience',
    example: 3,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  maxYears?: number | null;
}
