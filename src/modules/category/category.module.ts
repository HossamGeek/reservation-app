import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryEntity } from './entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentModule } from '../document/document.module';
import { ServiceTypeController } from './service-type.controller';
import { ServiceTypeService } from './service-type.service';
import { ServiceTypeEntity } from './entities/service-type.entity';
import { ServiceTypeOptionEntity } from './entities/service-type-option.entity';
import { ServiceTypeOptionService } from './service-type-option.service';
import { ServiceTypeOptionController } from './service-type-option.controller';
import { MobileCategoryController } from './mobile-category.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategoryEntity,
      ServiceTypeEntity,
      ServiceTypeOptionEntity,
    ]),
    DocumentModule,
  ],
  controllers: [
    CategoryController,
    MobileCategoryController,
    ServiceTypeController,
    ServiceTypeOptionController,
  ],
  providers: [CategoryService, ServiceTypeService, ServiceTypeOptionService],
  exports: [CategoryService, ServiceTypeService, ServiceTypeOptionService],
})
export class CategoryModule {}
