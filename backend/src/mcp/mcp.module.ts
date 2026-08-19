import { Module } from '@nestjs/common';
import { McpOauthModule } from '../mcp-oauth/mcp-oauth.module';
import { MealsModule } from '../meals/meals.module';
import { NutritionModule } from '../nutrition/nutrition.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';
import { UsersModule } from '../users/users.module';
import { McpProviderService } from './mcp-provider.service';

@Module({
  imports: [
    McpOauthModule,
    MealsModule,
    NutritionModule,
    UsersModule,
    RecommendationsModule,
  ],
  providers: [McpProviderService],
  exports: [McpProviderService],
})
export class McpModule {}
