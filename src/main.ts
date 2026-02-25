import 'reflect-metadata';
// Load .env.production FIRST, before anything else (for Railway deployment)
import * as fs from 'fs';
import * as path from 'path';

// Manually load .env.production if it exists
const envProdPath = path.join(process.cwd(), '.env.production');
if (fs.existsSync(envProdPath)) {
  const envContent = fs.readFileSync(envProdPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
        if (!process.env[key]) {
          // Only set if not already set (allows Railway env vars to override)
          process.env[key] = value;
        }
      }
    }
  });
}

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Debug: Check if .env.production exists and log its contents (Railway diagnosis)
  // eslint-disable-next-line no-console
  console.log('=== Environment Variables Debug ===');
  const envProdPath = path.join(process.cwd(), '.env.production');
  // eslint-disable-next-line no-console
  console.log('Current working directory:', process.cwd());
  // eslint-disable-next-line no-console
  console.log('.env.production path:', envProdPath);
  // eslint-disable-next-line no-console
  console.log('.env.production exists:', fs.existsSync(envProdPath));
  if (fs.existsSync(envProdPath)) {
    // eslint-disable-next-line no-console
    console.log('.env.production content (first 100 chars):', fs.readFileSync(envProdPath, 'utf8').substring(0, 100));
  }
  // eslint-disable-next-line no-console
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET (hidden)' : 'UNDEFINED');
  // eslint-disable-next-line no-console
  console.log('PORT:', process.env.PORT);
  // eslint-disable-next-line no-console
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET (hidden)' : 'UNDEFINED');
  // eslint-disable-next-line no-console
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
  // eslint-disable-next-line no-console
  console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('RAILWAY')).join(', '));
  // eslint-disable-next-line no-console
  console.log('===================================');

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

