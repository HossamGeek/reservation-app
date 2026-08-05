import configs from 'src/libs/configs/configs';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { RedisOptions } from 'ioredis';

export const redisConfig: RedisOptions = {
  host: configs.REDIS_HOST,
  port: Number(configs.REDIS_PORT),
  db: configs.REDIS_DB,
  password: configs.REDIS_PASSWORD,
  keepAlive: 10000,
  ...(configs.NODE_ENV === 'PROD' ? { tls: {} } : {}),
};

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: (): RedisModuleOptions => ({
        type: 'single',
        options: redisConfig,
      }),
    }),
  ],
  exports: [RedisModule],
})
export class ERPRedisModule {}
