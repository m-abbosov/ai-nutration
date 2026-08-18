import { Module } from '@nestjs/common';
import { AdminAiModule } from './admin-ai/admin-ai.module';
import { AdminAnalyticsModule } from './admin-analytics/admin-analytics.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { AdminCalculatorsModule } from './admin-calculators/admin-calculators.module';
import { AdminConversationsModule } from './admin-conversations/admin-conversations.module';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';
import { AdminNutritionModule } from './admin-nutrition/admin-nutrition.module';
import { AdminSettingsModule } from './admin-settings/admin-settings.module';
import { AdminSystemModule } from './admin-system/admin-system.module';
import { AdminTeamModule } from './admin-team/admin-team.module';
import { AdminUsersModule } from './admin-users/admin-users.module';

@Module({
  imports: [
    AdminAuthModule,
    AdminUsersModule,
    AdminDashboardModule,
    AdminAnalyticsModule,
    AdminAiModule,
    AdminCalculatorsModule,
    AdminConversationsModule,
    AdminNutritionModule,
    AdminSystemModule,
    AdminTeamModule,
    AdminSettingsModule,
  ],
})
export class AdminModule {}
