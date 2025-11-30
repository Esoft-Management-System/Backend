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
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  const port = Number(process.env.PORT) || 3000;
  // listen on 0.0.0.0 so Render (and other hosts) can access the server externally
  await app.listen(port, '0.0.0.0');

  console.log(`Server running on port ${port}`);
  console.log(`Swagger docs available at /${globalPrefix}/docs`);
}

void bootstrap();
