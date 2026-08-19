import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import type Provider from 'oidc-provider';

// oidc-provider's own default `routes` config (see oidc-provider docs) plus
// the two well-known discovery documents it always serves. Matched on the
// first path segment only, since sub-paths like `/token/introspection` and
// `/device/auth` both start with a route already listed here.
const OIDC_PATH_PREFIXES =
  /^\/(auth|backchannel|challenge|credential|device|jwks|me|reg|request|session|token)(\/|$)/;
const OIDC_WELL_KNOWN =
  /^\/\.well-known\/(openid-configuration|oauth-authorization-server)(\/|$)/;

/**
 * Delegates matching requests to oidc-provider's own Koa app (via
 * `.callback()`), leaving everything else for Nest's own routes.
 *
 * oidc-provider's callback ALWAYS produces a response (it has no concept of
 * Express's `next()` pass-through) — so it must only ever be invoked for
 * paths it actually owns, never mounted unconditionally, or it would
 * swallow every other route (including all of `/api/*`) with a 404.
 */
export function mountOidcProvider(
  app: NestExpressApplication,
  provider: Provider,
): void {
  const oidcCallback = provider.callback();
  const expressInstance = app.getHttpAdapter().getInstance();

  expressInstance.use(
    (req: Request, res: Response, next: NextFunction): void => {
      if (OIDC_PATH_PREFIXES.test(req.path) || OIDC_WELL_KNOWN.test(req.path)) {
        oidcCallback(req, res).catch(next);
        return;
      }
      next();
    },
  );
}
