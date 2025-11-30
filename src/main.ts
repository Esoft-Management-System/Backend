import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Esoft Management API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerCustomOptions = {
    customSiteTitle: 'Esoft Management API',
    customCssUrl:
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.18.2/swagger-ui.css',
    customJs: [
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.18.2/swagger-ui-bundle.js',
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.18.2/swagger-ui-standalone-preset.js',
    ],
  };

  SwaggerModule.setup(
    `${globalPrefix}/docs`,
    app,
    document,
    swaggerCustomOptions,
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  console.log(
    'Swagger docs available on: ',
    `http://localhost:${port}/${globalPrefix}/docs`,
  );
}

void bootstrap();
