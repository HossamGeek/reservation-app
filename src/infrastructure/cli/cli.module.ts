import { Module } from '@nestjs/common';

import { UpdateSuperAdminRoleCli } from './update-super-role.cli';
import { DatabaseModule } from '../database/database.module';
import { UpdateSuperAdminUserCli } from './super-admin.cli';
import { ConfigModule } from '@nestjs/config';
import envValidationSchema from 'src/libs/configs/validate-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validationSchema: envValidationSchema,
    }),
    DatabaseModule,
  ],
  providers: [UpdateSuperAdminRoleCli, UpdateSuperAdminUserCli],
})
export class CliModule {}
