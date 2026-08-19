import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { CalculatorsModule } from './calculators/calculators.module';
import { ChatModule } from './chat/chat.module';
import { FeatureFlagsModule } from './common/feature-flags/feature-flags.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { MaintenanceModeGuard } from './common/guards/maintenance-mode.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SystemLogRetentionService } from './common/system-log-retention.service';
import { validateEnv } from './config/env.validation';
import { DashboardModule } from './dashboard/dashboard.module';
import { DatabaseModule } from './database/database.module';
import { FitnessModule } from './fitness/fitness.module';
import { HealthModule } from './health/health.module';
import { McpModule } from './mcp/mcp.module';
import { McpOauthModule } from './mcp-oauth/mcp-oauth.module';
import { MealsModule } from './meals/meals.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    // Generous global default; chat-message and recommendations endpoints
    // override this with a stricter 20/min via @Throttle to cap Gemini spend.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    DatabaseModule,
    FeatureFlagsModule,
    AuditModule,
    AiModule,
    AuthModule,
    UsersModule,
    CalculatorsModule,
    McpOauthModule,
    McpModule,
    MealsModule,
    NutritionModule,
    DashboardModule,
    FitnessModule,
    ChatModule,
    RecommendationsModule,
    HealthModule,
    AdminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: MaintenanceModeGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    SystemLogRetentionService,
  ],
})
export class AppModule {}
