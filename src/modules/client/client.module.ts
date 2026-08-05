import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityModule } from '../city/city.module';
import { DocumentModule } from '../document/document.module';
import { UserModule } from '../user/user.module';
import { ClientController } from './controllers/client.controller';
import { ClientAddressEntity } from './entities/client-address.entity';
import { ClientEntity } from './entities/client.entity';
import { ClientService } from './services/client.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientEntity, ClientAddressEntity]),
    CityModule,
    UserModule,
    DocumentModule,
  ],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}
