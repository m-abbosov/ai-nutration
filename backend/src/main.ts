import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { EnvConfig } from './config/env.validation';
import { McpProviderService } from './mcp/mcp-provider.service';
import { mountMcp } from './mcp/mount-mcp';
import { mountOidcProvider } from './mcp-oauth/mount-oidc-provider';
import { OidcProviderService } from './mcp-oauth/oidc-provider.service';

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

  // The MCP OAuth authorization server (oidc-provider) is mounted RAW on the
  // underlying Express instance, at the domain root — the MCP authorization
  // spec's well-known discovery paths are fixed by convention and must sit
  // alongside, not under, the `/api` prefix Nest's own controllers get
  // below. It only ever handles its own specific paths and calls Express's
  // `next()` for anything else, so this is safe to mount before
  // `setGlobalPrefix` — see mcp-oauth/mount-oidc-provider.ts for exactly
  // which paths. The MCP resource server (/mcp) mounts the same way — see
  // mcp/mount-mcp.ts.
  const oidcProviderService = app.get(OidcProviderService);
  mountOidcProvider(app, oidcProviderService.provider);
  mountMcp(app, app.get(McpProviderService), oidcProviderService.resource);

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
