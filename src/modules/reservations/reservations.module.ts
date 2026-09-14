import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderModule } from '../provider/provider.module';
import { ServiceModule } from '../service/service.module';
import { ShiftModule } from '../shifts/shift.module';
import { ReservationEntity } from './entities/reservation.entity';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservationEntity]),
    ServiceModule,
    ShiftModule,
    ProviderModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}