import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Provider, { errors } from 'oidc-provider';
import { EnvConfig } from '../config/env.validation';
import { PrismaService } from '../database/prisma.service';
import { createOidcAdapterFactory } from './prisma-oidc-adapter';

/** The single scope our MCP resource server grants — we expose one tool
 * set (see mcp/), not per-tool scoping, matching the "full access" scope
 * the user chose for this feature. */
export const MCP_SCOPE = 'mcp';

/**
 * The OAuth 2.1 authorization server that lets Claude/ChatGPT (or any MCP
 * client) connect to our MCP resource server (see mcp/mcp.controller.ts)
 * using the end-user's own NutriAI account — no shared API key involved.
 * Wraps `oidc-provider`, configured per its documented requirements for the
 * MCP authorization spec: PKCE mandatory, Dynamic Client Registration open
 * (Claude/ChatGPT self-register on first connect), Resource Indicators
 * (RFC 8707) bound to our one resource (`${BACKEND_URL}/mcp`).
 *
 * Login/consent UI lives on the frontend (see McpOauthInteractionController
 * for the JSON API it drives) — `oidc-provider` itself only implements the
 * OAuth protocol endpoints (/auth, /token, /reg, /.well-known/*), which are
 * mounted raw on the Express app in main.ts (bypassing Nest's `/api`
 * prefix — these paths are spec-fixed and must sit at the domain root).
 */
@Injectable()
export class OidcProviderService {
  public readonly provider: Provider;
  public readonly resource: string;

  constructor(
    configService: ConfigService<EnvConfig, true>,
    prisma: PrismaService,
  ) {
    const backendUrl = configService.get('BACKEND_URL', { infer: true });
    const frontendUrl = configService.get('FRONTEND_URL', { infer: true });
    const configuredCookieKey = configService.get('MCP_OAUTH_COOKIE_KEYS', {
      infer: true,
    });

    this.resource = `${backendUrl}/mcp`;
    const cookieKeys = configuredCookieKey
      ? [configuredCookieKey]
      : [randomBytes(32).toString('hex')];

    this.provider = new Provider(backendUrl, {
      adapter: createOidcAdapterFactory(prisma),

      cookies: {
        keys: cookieKeys,
        // The consent UI lives on a different origin (frontend app) than
        // this authorization server, so its fetches to the interaction API
        // are cross-site — these cookies MUST be sendable cross-site.
        long: { sameSite: 'none', secure: true },
        short: { sameSite: 'none', secure: true },
      },

      pkce: {
        // MCP's authorization spec requires PKCE unconditionally, not just
        // for public clients (oidc-provider's own default).
        required: () => true,
      },

      // We never request the 'openid' scope from clients (pure OAuth 2.1,
      // no identity/ID-token flow) — kept minimal rather than removed since
      // oidc-provider always advertises it.
      claims: { openid: ['sub'] },

      features: {
        // oidc-provider ships its own built-in login/consent pages at
        // `/interaction/:uid` by default (`devInteractions`), which
        // otherwise silently overrides `interactions.url` below and serves
        // oidc-provider's own quick-start UI instead of our frontend
        // consent screen.
        devInteractions: { enabled: false },
        registration: {
          // Open Dynamic Client Registration: Claude/ChatGPT self-register
          // on first connect, exactly like the MCP spec expects for a
          // "paste the URL and connect" UX with no manual client setup.
          enabled: true,
        },
        resourceIndicators: {
          enabled: true,
          defaultResource: async () => this.resource,
          getResourceServerInfo: async (_ctx, resourceIndicator) => {
            if (resourceIndicator !== this.resource) {
              throw new errors.InvalidTarget(
                `Unknown resource indicator: ${resourceIndicator}`,
              );
            }
            return { scope: MCP_SCOPE };
          },
        },
      },

      // Refresh tokens by default require the 'offline_access' scope
      // (standard OIDC convention) — we don't use OIDC scopes at all, so
      // issue one whenever the client supports the grant type, full stop.
      issueRefreshToken: async (_ctx, client) =>
        client.grantTypeAllowed('refresh_token'),

      async findAccount(_ctx, accountId) {
        // Our own NutriAI user id, set at login time in the consent
        // interaction — no separate account store to query here.
        return {
          accountId,
          async claims() {
            return { sub: accountId };
          },
        };
      },

      interactions: {
        url: async (_ctx, interaction) =>
          `${frontendUrl}/oauth/consent/${interaction.uid}`,
      },
    });

    // `Provider` extends Koa — a separate app instance from Nest's own
    // Express app (which trusts the proxy via `app.set('trust proxy', 1)`
    // in main.ts). On Railway TLS terminates at the edge, so without this
    // Koa sees a plain-HTTP connection and refuses to write the `secure`
    // interaction cookies configured above.
    this.provider.proxy = true;
  }
}
