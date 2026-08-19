import { Module } from '@nestjs/common';
import { McpOauthInteractionController } from './mcp-oauth-interaction.controller';
import { OidcProviderService } from './oidc-provider.service';

@Module({
  controllers: [McpOauthInteractionController],
  providers: [OidcProviderService],
  exports: [OidcProviderService],
})
export class McpOauthModule {}
