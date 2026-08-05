import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DayEntity } from './entities/day.entity';
import { DayService } from './day.service';
import { DayController } from './day.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DayEntity])],
  controllers: [DayController],
  providers: [DayService],
  exports: [DayService],
})
export class DayModule {}
