import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class RejectReservationDto {
  // @ApiProperty({
  //   description: 'Reservation rejection reason',
  //   maxLength: 500,
  // })
  // @IsNotEmpty()
  // @IsString()
  // @Matches(/\S/, { message: 'reason must not be blank' })
  // @MaxLength(500)
  reason: string;
}