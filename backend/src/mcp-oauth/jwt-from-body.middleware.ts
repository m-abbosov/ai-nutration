import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * The interaction login/confirm/deny endpoints are now hit via a real
 * top-level `<form method="POST">` submission from the consent page (see
 * mcp-oauth-interaction.controller.ts for why — cross-origin `fetch()`
 * doesn't reliably carry the oidc-provider interaction cookie under modern
 * browsers' third-party cookie restrictions, but a real navigation does).
 * A form can't set an `Authorization` header, so the access token travels
 * as a body field instead — this bridges it back to a normal
 * `Authorization: Bearer` header before `JwtAuthGuard` runs, so the rest of
 * the auth stack (JwtStrategy et al.) needs no special-casing.
 */
@Injectable()
export class JwtFromBodyMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const bodyToken = (req.body as Record<string, unknown> | undefined)?.[
      'accessToken'
    ];
    if (!req.headers.authorization && typeof bodyToken === 'string') {
      req.headers.authorization = `Bearer ${bodyToken}`;
    }
    next();
  }
}
