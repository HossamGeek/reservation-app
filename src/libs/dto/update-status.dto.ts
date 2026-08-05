import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Resource active status',
    type: Boolean,
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
