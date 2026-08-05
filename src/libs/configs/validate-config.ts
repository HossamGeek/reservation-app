import * as Joi from 'joi';
import * as dotenv from 'dotenv';

dotenv.config();

const joiNumberCasting = Joi.alternatives().try(
  Joi.number(),
  Joi.string()
    .regex(/^\d+$/)
    .custom((value) => Number(value)),
);

const envValidationSchema = Joi.object({
  // General configuration
  NODE_ENV: Joi.string().valid('DEV', 'TEST', 'DEMO', 'PROD').required(),
  PORT: joiNumberCasting.required(),

  // Database configuration
  DB_HOST: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_PORT: joiNumberCasting.required(),

  // Redis configuration
  REDIS_HOST: Joi.string().required(),
  REDIS_PASSWORD: Joi.string().allow(''),
  REDIS_PORT: joiNumberCasting.required(),
  REDIS_DB: joiNumberCasting.required(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_EXPIRY: Joi.string().required(),
  BASE_URL: Joi.string().uri().required(),

  // Local File Upload Config
  MAX_FILE_SIZE: joiNumberCasting.required(),
}).strict(); // Ensure only specified keys are allowed

export default envValidationSchema;
