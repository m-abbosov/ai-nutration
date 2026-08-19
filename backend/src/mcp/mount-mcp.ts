import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { requireBearerAuth } from '@modelcontextprotocol/express';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { getOAuthProtectedResourceMetadataUrl } from '@modelcontextprotocol/server';
import { MCP_SCOPE } from '../mcp-oauth/oidc-provider.service';
import { McpProviderService } from './mcp-provider.service';

const MCP_PATH = '/mcp';
const PROTECTED_RESOURCE_METADATA_PATH =
  '/.well-known/oauth-protected-resource/mcp';

/**
 * Raw-mounts the MCP resource server on the underlying Express instance, at
 * the domain root, the same way mcp-oauth/mount-oidc-provider.ts mounts the
 * authorization server — `/mcp` and its RFC 9728 discovery document are
 * spec-fixed paths that must sit alongside, not under, Nest's `/api` prefix.
 * Must be called before `app.listen()` (see main.ts), same ordering
 * requirement as `mountOidcProvider`.
 */
export function mountMcp(
  app: NestExpressApplication,
  mcpProviderService: McpProviderService,
  resource: string,
): void {
  const nodeHandler = toNodeHandler(mcpProviderService.handler);
  const resourceMetadataUrl = getOAuthProtectedResourceMetadataUrl(
    new URL(resource),
  );
  const bearerAuth = requireBearerAuth({
    verifier: mcpProviderService.verifier,
    requiredScopes: [MCP_SCOPE],
    resourceMetadataUrl,
  });

  const protectedResourceMetadata = {
    resource,
    authorization_servers: [new URL(resource).origin],
    scopes_supported: [MCP_SCOPE],
    bearer_methods_supported: ['header'],
    resource_name: 'NutriAI',
  };

  const expressInstance = app.getHttpAdapter().getInstance();

  expressInstance.use(
    (req: Request, res: Response, next: NextFunction): void => {
      if (req.path === PROTECTED_RESOURCE_METADATA_PATH) {
        res.json(protectedResourceMetadata);
        return;
      }
      if (req.path === MCP_PATH) {
        bearerAuth(req, res, (err?: unknown) => {
          if (err) {
            next(err);
            return;
          }
          nodeHandler(req, res).catch(next);
        });
        return;
      }
      next();
    },
  );
}
