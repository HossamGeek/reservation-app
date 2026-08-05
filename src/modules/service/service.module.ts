import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentModule } from '../document/document.module';
import { ServiceEntity } from './entities/service.entity';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { CategoryModule } from '../category/category.module';
import { MobileServiceController } from './mobile-service.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceEntity]),
    DocumentModule,
    CategoryModule,
  ],
  controllers: [ServiceController, MobileServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
