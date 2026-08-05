import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NationalityEntity } from './entities/nationality.entity';
import { NationalityService } from './nationality.service';
import { NationalityController } from './nationality.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NationalityEntity])],
  controllers: [NationalityController],
  providers: [NationalityService],
  exports: [NationalityService],
})
export class NationalityModule {}
