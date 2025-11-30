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

  const port = Number(process.env.PORT) || 3000;
  // listen on 0.0.0.0 so Render (and other hosts) can access the server externally
  await app.listen(port, '0.0.0.0');

  console.log(`Server running on port ${port}`);
  console.log(`Swagger docs available at /${globalPrefix}/docs`);
}

void bootstrap();
