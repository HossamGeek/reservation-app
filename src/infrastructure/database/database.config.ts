import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'node:path';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',

  host: configService.getOrThrow('DB_HOST'),
  port: Number(configService.getOrThrow('DB_PORT')),
  username: configService.getOrThrow('DB_USERNAME'),
  password: configService.getOrThrow('DB_PASSWORD'),
  database: configService.getOrThrow('DB_DATABASE'),

  autoLoadEntities: true,

  migrations: [path.join(__dirname, 'migrations', '*.{js,ts}')],

  synchronize: false,
  migrationsRun: false,

  logging: configService.get('NODE_ENV') === 'DEV',

  retryAttempts: 5,
  retryDelay: 3000,
});
