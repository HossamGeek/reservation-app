import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { TrimPipe } from './libs/transformers/trim.transformer';
import { RemoveNullKeysPipe } from './libs/transformers/remove-null-pipe';
import { ErrorFormatter } from './libs/errors/typeorm.error.filter';
import { setupSwagger } from 'src/libs/swagger/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    index: false,
    prefix: '/public',
  });

  app.setGlobalPrefix('api', {
    exclude: [
      {
        path: '/',
        method: RequestMethod.ALL,
      },
    ],
  });

  // validation pipes

  app.useGlobalPipes(new RemoveNullKeysPipe());

  app.useGlobalPipes(new TrimPipe());

  app.useGlobalPipes(new ErrorFormatter());

  if (process.env.NODE_ENV !== 'PROD') {
    setupSwagger(app);
  }

  await app.listen(process.env.PORT ?? 5505);
  Logger.log(
    `Application is running on port : ${process.env.APP_PORT ?? 5505}`,
    'Bootstrap',
  );
}
void bootstrap();
