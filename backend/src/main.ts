import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3001);
  const clientUrl = config.get<string>('CLIENT_URL', 'http://localhost:5173');

  // Security
  app.use(helmet({ crossOriginEmbedderPolicy: false }));
  app.use(compression());
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: [clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger docs
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('El Shaddai API')
      .setDescription('El Shaddai Interior Design Platform — REST API')
      .setVersion('2.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication & authorisation')
      .addTag('users', 'User management')
      .addTag('organisations', 'Organisation management')
      .addTag('projects', 'Project lifecycle')
      .addTag('tasks', 'Task & Kanban board')
      .addTag('time-logs', 'Time tracking')
      .addTag('expenses', 'Expense management')
      .addTag('messages', 'Project messaging')
      .addTag('design-assets', 'Design file uploads')
      .addTag('ai', 'AI design generation')
      .addTag('admin', 'Admin panel')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
  console.log(`\n🏠  El Shaddai API running on http://localhost:${port}/api`);
  console.log(`📖  Swagger docs  → http://localhost:${port}/api/docs\n`);
}

bootstrap();
