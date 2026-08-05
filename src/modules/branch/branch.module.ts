import { forwardRef, Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchEntity } from './entities/branch.entity';
import { CityModule } from '../city/city.module';
import { ProviderModule } from '../provider/provider.module';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BranchEntity]),
    CityModule,
    forwardRef(() => ProviderModule),
    DocumentModule,
  ],
  controllers: [BranchController],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule {}
