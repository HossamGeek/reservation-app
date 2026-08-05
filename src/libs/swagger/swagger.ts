import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DEFAULT_LANGUAGE } from '../constants/global-constants';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('ERP API')
    .setDescription(
      'ERP REST API documentation. This API supports localization using the Accept-Language header (en, ar).',
    )
    .setVersion('1.0.0')

    // JWT Auth
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT access token',
      },
      'JWT',
    )

    // Global language header
    .addGlobalParameters({
      name: 'Accept-Language',
      in: 'header',
      required: false,
      description: 'Localization language (en, ar)',
      schema: {
        default: DEFAULT_LANGUAGE,
        example: DEFAULT_LANGUAGE,
      },
    })

    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
