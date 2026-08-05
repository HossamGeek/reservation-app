import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReligionEntity } from './entities/religion.entity';
import { ReligionService } from './religion.service';
import { ReligionController } from './religion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReligionEntity])],
  controllers: [ReligionController],
  providers: [ReligionService],
  exports: [ReligionService],
})
export class ReligionModule { }
