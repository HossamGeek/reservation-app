import { forwardRef, Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderEntity } from './entities/provider.entity';
import { DocumentModule } from '../document/document.module';
import { UserModule } from '../user/user.module';
import { ProviderAdminEntity } from '../user/entities/provider-admin.entity';
import { BranchModule } from '../branch/branch.module';
import { CityModule } from '../city/city.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProviderEntity, ProviderAdminEntity]),
    DocumentModule,
    UserModule,
    forwardRef(() => BranchModule),
    CityModule,
  ],
  controllers: [ProviderController],
  providers: [ProviderService],
  exports: [ProviderService],
})
export class ProviderModule {}
