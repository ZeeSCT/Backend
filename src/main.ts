import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔐 Security
  app.use(helmet());

  // 🌐 CORS FIX
  app.enableCors({
  origin: ['http://localhost:3002'],
  credentials: true,
});

  // 📦 Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 📘 Swagger
  const config = new DocumentBuilder()
    .setTitle('Scientechnic Unified Platform API')
    .setDescription('Dashboard backend APIs')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, doc);

  // 🚀 START SERVER
  await app.listen(process.env.PORT || 3001);

  console.log(
    `API running on http://localhost:${process.env.PORT || 3001}`,
  );
}

bootstrap();