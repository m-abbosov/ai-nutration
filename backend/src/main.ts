import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { EnvConfig } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService<EnvConfig, true>);

  // Railway (and most PaaS) sit behind a reverse proxy — trust its
  // X-Forwarded-For so `req.ip` (used by AuditLogService for admin IP
  // capture) reflects the real client, not the proxy hop.
  app.set('trust proxy', 1);

  app.use(helmet());

  app.enableCors({
    origin: [
      configService.get('FRONTEND_URL', { infer: true }),
      configService.get('ADMIN_FRONTEND_URL', { infer: true }),
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get('PORT', { infer: true });
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`NutriAI backend listening on port ${port} (prefix: /api)`);
}

bootstrap();
