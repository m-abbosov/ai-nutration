import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtFromBodyMiddleware } from './jwt-from-body.middleware';
import { McpOauthInteractionController } from './mcp-oauth-interaction.controller';
import { OidcProviderService } from './oidc-provider.service';

@Module({
  controllers: [McpOauthInteractionController],
  providers: [OidcProviderService],
  exports: [OidcProviderService],
})
export class McpOauthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Only login/confirm/deny carry a body; harmless no-op for the GET
    // `view` route, which never has an accessToken field to bridge.
    consumer
      .apply(JwtFromBodyMiddleware)
      .forRoutes(McpOauthInteractionController);
  }
}
