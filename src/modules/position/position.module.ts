import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionEntity } from './entities/position.entity';
import { PositionService } from './position.service';
import { PositionController } from './position.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PositionEntity])],
  controllers: [PositionController],
  providers: [PositionService],
  exports: [PositionService],
})
export class PositionModule { }
