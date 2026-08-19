import { Injectable, Logger } from '@nestjs/common';
import { createMcpHandler } from '@modelcontextprotocol/server';
import type { AuthInfo, McpHttpHandler } from '@modelcontextprotocol/server';
import { MealsService } from '../meals/meals.service';
import { NutritionService } from '../nutrition/nutrition.service';
import { OidcProviderService } from '../mcp-oauth/oidc-provider.service';
import { RecommendationsService } from '../recommendations/recommendations.service';
import { UsersService } from '../users/users.service';
import { buildMcpServer } from './mcp-tools';
import { McpTokenVerifier } from './mcp-token-verifier';

/**
 * Builds the MCP resource server: an `McpHttpHandler` (web-standard
 * fetch-based, per the `@modelcontextprotocol/server` v2 API) that serves
 * `POST/GET/DELETE /mcp`, and the bearer-token verifier that guards it. See
 * mcp/mount-mcp.ts for how these get raw-mounted on Express, mirroring
 * mcp-oauth/mount-oidc-provider.ts.
 */
@Injectable()
export class McpProviderService {
  private readonly logger = new Logger(McpProviderService.name);
  public readonly handler: McpHttpHandler;
  public readonly verifier: McpTokenVerifier;

  constructor(
    oidcProviderService: OidcProviderService,
    meals: MealsService,
    nutrition: NutritionService,
    users: UsersService,
    recommendations: RecommendationsService,
  ) {
    this.verifier = new McpTokenVerifier(oidcProviderService.provider);

    this.handler = createMcpHandler(
      (ctx) => {
        const authInfo = ctx.authInfo as AuthInfo;
        const accountId = authInfo.extra?.accountId as string;
        return buildMcpServer(accountId, {
          meals,
          nutrition,
          users,
          recommendations,
        });
      },
      { onerror: (error) => this.logger.error(error) },
    );
  }
}
