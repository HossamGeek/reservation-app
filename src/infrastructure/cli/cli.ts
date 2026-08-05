import { NestFactory } from '@nestjs/core';

import { CommandFactory } from 'nest-commander';

import { CliModule } from './cli.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CliModule);
  await CommandFactory.run(CliModule, ['log', 'warn', 'error']);
  await app.close();
}

void bootstrap().catch((error) => {
  Logger.error(error);
  process.exit(1);
});
