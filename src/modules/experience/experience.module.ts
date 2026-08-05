import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperienceEntity } from './entities/experience.entity';
import { ExperienceService } from './experience.service';
import { ExperienceController } from './experience.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExperienceEntity])],
  controllers: [ExperienceController],
  providers: [ExperienceService],
  exports: [ExperienceService],
})
export class ExperienceModule { }
