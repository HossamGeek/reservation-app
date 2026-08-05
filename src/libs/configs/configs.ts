import * as process from 'process';
import * as dotenv from 'dotenv';
import { convertJwtTimeToMilliseconds } from '../utils/methods';

dotenv.config();

export default {
  // General
  NODE_ENV: process.env.NODE_ENV ?? 'DEV',
  PORT: Number(process.env.APP_PORT ?? 5505),

  // Database (PostgreSQL)
  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT),
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,

  // Redis
  REDIS_HOST: process.env.REDIS_HOST ?? 'localhost',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD ?? undefined,
  REDIS_PORT: Number(process.env.REDIS_PORT ?? 6379),
  REDIS_DB: Number(process.env.REDIS_DB ?? 0),
  REDIS_URL: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB}`,
  REDIS_TTL: convertJwtTimeToMilliseconds(process.env.REDIS_KEYS_TTL ?? '10m'),

  // JWT
  JWT_SECRET: process.env.JWT_SECRET ?? 'users-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '1d',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY!,

  // Local File Upload Config
  MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE ?? 5242880),
};
