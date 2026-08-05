import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { RoleModule } from 'src/modules/role/role.module';
import { WorkerEntity } from './entities/worker.entity';
import { ClientEntity } from 'src/modules/client/entities/client.entity';
import { SystemAdminEntity } from './entities/system-admin.entity';
import { ProviderAdminEntity } from './entities/provider-admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      WorkerEntity,
      ClientEntity,
      SystemAdminEntity,
      ProviderAdminEntity,
    ]),
    RoleModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
