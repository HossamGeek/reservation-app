import { Module } from '@nestjs/common';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';
import { ShiftEntity } from './entities/shift.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderModule } from '../provider/provider.module';
@Module({
  imports: [TypeOrmModule.forFeature([ShiftEntity]), ProviderModule],
  controllers: [ShiftController],
  providers: [ShiftService],
})
export class ShiftModule {}
