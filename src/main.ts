import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Simple env check for Railway
  // eslint-disable-next-line no-console
  console.log('Starting app... PORT:', process.env.PORT || '8002');
  // eslint-disable-next-line no-console
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');
  // eslint-disable-next-line no-console
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'MISSING');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration for frontend integration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('CRUD Fastify API')
    .setDescription('Social Media API built with NestJS + Fastify + Prisma')
    .setVersion('1.0')
    .addTag('users', 'User management endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addTag('posts', 'Post management endpoints')
    .addTag('votes', 'Vote/like endpoints')
    .addTag('health', 'Health check endpoint')
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          password: {
            tokenUrl: '/login',
            scopes: {},
          },
        },
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8002;

  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`Nest Fastify API running at http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();

