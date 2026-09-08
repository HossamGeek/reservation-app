import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationEntity } from './entities/reservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReservationEntity])],
})
export class ReservationsModule {}
