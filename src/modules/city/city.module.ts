import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { CityEntity } from './entities/city.entity';
import { CountryModule } from '../country/country.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CityEntity]),
    CountryModule
  ],
  controllers: [CityController],
  providers: [CityService],
  exports: [CityService],
})
export class CityModule {}
