import { OAuthError, OAuthErrorCode } from '@modelcontextprotocol/server';
import type {
  AuthInfo,
  OAuthTokenVerifier,
} from '@modelcontextprotocol/server';
import type Provider from 'oidc-provider';

/**
 * Verifies MCP bearer tokens against our own `oidc-provider` instance
 * (see mcp-oauth/oidc-provider.service.ts) — the SAME access tokens issued
 * to Claude/ChatGPT when the user connects their account. `AccessToken.find`
 * is oidc-provider's own resource-server-side introspection, backed by the
 * Prisma adapter (mcp-oauth/prisma-oidc-adapter.ts).
 *
 * `accountId` (our NutriAI user id, set at login time — see
 * McpOauthInteractionController) is threaded through as `AuthInfo.extra`,
 * which every tool handler reads to scope its data access.
 */
export class McpTokenVerifier implements OAuthTokenVerifier {
  constructor(private readonly provider: Provider) {}

  async verifyAccessToken(token: string): Promise<AuthInfo> {
    const accessToken = await this.provider.AccessToken.find(token);
    if (!accessToken || !accessToken.isValid) {
      throw new OAuthError(
        OAuthErrorCode.InvalidToken,
        'Invalid or expired access token',
      );
    }

    return {
      token,
      clientId: accessToken.clientId ?? '',
      scopes: accessToken.scope ? accessToken.scope.split(' ') : [],
      expiresAt: accessToken.exp,
      extra: { accountId: accessToken.accountId },
    };
  }
}
