import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditLogService } from '../../audit/audit-log.service';
import { formatDateOnly } from '../../common/date.util';
import { FeatureAccessService } from '../../common/feature-access/feature-access.service';
import { toMealResponseDto } from '../../meals/meals.mapper';
import { eachDate, currentWindow } from '../common/range.util';
import { PaginatedDto, paginationParams } from '../common/pagination.dto';
import { PrismaService } from '../../database/prisma.service';
import { AdminUserDetailDto, AdminUserListItemDto } from './dto/admin-user.dto';
import { FindAdminUsersQueryDto } from './dto/find-admin-users-query.dto';
import { AdminUserFeatureDto } from './dto/user-feature.dto';

/** Real users always have exactly one of googleId/telegramId set by the
 * auth flow that created them (loginWithGoogle/loginWithTelegram). The
 * GOOGLE fallback below is only reached for a row with neither set — not
 * possible via either auth flow, but the dev seed's directly-inserted user
 * can hit it, so this stays defensive rather than silently mislabeling a
 * Telegram user as Google. */
function resolveAuthProvider(
  googleId: string | null,
  telegramId: string | null,
): 'GOOGLE' | 'TELEGRAM' {
  if (googleId) return 'GOOGLE';
  if (telegramId) return 'TELEGRAM';
  return 'GOOGLE';
}

interface RawUserRow {
  id: string;
  name: string;
  email: string | null;
  telegramId: string | null;
  googleId: string | null;
  avatarUrl: string | null;
  goal: string | null;
  weightKg: number | null;
  dailyCalorieTarget: number | null;
  createdAt: Date;
  status: string;
  lastActiveAt: Date | null;
  mealsCount: bigint;
  aiRequestsCount: bigint;
}

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly featureAccess: FeatureAccessService,
  ) {}

  async list(
    query: FindAdminUsersQueryDto,
  ): Promise<PaginatedDto<AdminUserListItemDto>> {
    const { page, pageSize, skip, take } = paginationParams(query);

    const conditions: Prisma.Sql[] = [];
    if (query.search) {
      conditions.push(
        Prisma.sql`(u.name ILIKE ${'%' + query.search + '%'} OR u.email ILIKE ${'%' + query.search + '%'})`,
      );
    }
    if (query.goal) {
      conditions.push(Prisma.sql`u.goal = ${query.goal}::"Goal"`);
    }
    if (query.authProvider === 'google') {
      conditions.push(Prisma.sql`u."googleId" IS NOT NULL`);
    } else if (query.authProvider === 'telegram') {
      conditions.push(Prisma.sql`u."telegramId" IS NOT NULL`);
    }
    if (query.status) {
      conditions.push(Prisma.sql`u.status = ${query.status}::"UserStatus"`);
    }
    if (query.registeredFrom) {
      conditions.push(
        Prisma.sql`u."createdAt" >= ${new Date(query.registeredFrom)}`,
      );
    }
    if (query.registeredTo) {
      conditions.push(
        Prisma.sql`u."createdAt" <= ${new Date(query.registeredTo)}`,
      );
    }
    const whereClause = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

    const sortColumn =
      query.sortBy === 'name'
        ? Prisma.sql`u.name`
        : query.sortBy === 'lastActiveAt'
          ? Prisma.sql`"lastActiveAt"`
          : Prisma.sql`u."createdAt"`;
    const sortDirection =
      query.sortDir === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`;

    // Aggregates computed set-based (GROUP BY), not per-row in JS — meals
    // count/last-activity and AI request count each come from one join
    // against a pre-aggregated subquery, not N queries per user.
    const rows = await this.prisma.$queryRaw<RawUserRow[]>(Prisma.sql`
      SELECT
        u.id, u.name, u.email, u."telegramId", u."googleId", u."avatarUrl",
        u.goal, u."weightKg", u."dailyCalorieTarget", u."createdAt", u.status,
        GREATEST(u."lastLoginAt", m."maxMealAt", cm."maxChatAt") AS "lastActiveAt",
        COALESCE(m."mealsCount", 0) AS "mealsCount",
        COALESCE(ai."aiRequestsCount", 0) AS "aiRequestsCount"
      FROM users u
      LEFT JOIN (
        SELECT "userId", MAX("createdAt") AS "maxMealAt", COUNT(*) AS "mealsCount"
        FROM meals GROUP BY "userId"
      ) m ON m."userId" = u.id
      LEFT JOIN (
        SELECT c."userId", MAX(cm2."createdAt") AS "maxChatAt"
        FROM chat_messages cm2 JOIN conversations c ON c.id = cm2."conversationId"
        GROUP BY c."userId"
      ) cm ON cm."userId" = u.id
      LEFT JOIN (
        SELECT "userId", COUNT(*) AS "aiRequestsCount"
        FROM ai_request_logs WHERE "userId" IS NOT NULL GROUP BY "userId"
      ) ai ON ai."userId" = u.id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection} NULLS LAST
      LIMIT ${take} OFFSET ${skip}
    `);

    const [{ count }] = await this.prisma.$queryRaw<{ count: bigint }[]>(
      Prisma.sql`SELECT COUNT(*)::bigint AS count FROM users u ${whereClause}`,
    );

    const items: AdminUserListItemDto[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      telegramId: row.telegramId,
      authProvider: resolveAuthProvider(row.googleId, row.telegramId),
      avatarUrl: row.avatarUrl,
      goal: row.goal as AdminUserListItemDto['goal'],
      weightKg: row.weightKg,
      dailyCalorieTarget: row.dailyCalorieTarget,
      mealsCount: Number(row.mealsCount),
      aiRequestsCount: Number(row.aiRequestsCount),
      createdAt: row.createdAt.toISOString(),
      lastActiveAt: row.lastActiveAt ? row.lastActiveAt.toISOString() : null,
      status: row.status as AdminUserListItemDto['status'],
    }));

    return { items, total: Number(count), page, pageSize };
  }

  async detail(
    id: string,
    adminId: string,
    ipAddress: string | null,
  ): Promise<AdminUserDetailDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const [
      mealAgg,
      lastMeal,
      lastChatMessage,
      calorieRows,
      aiAgg,
      aiFailedCount,
      recentMeals,
      recentMealsForActivity,
      recentAiForActivity,
    ] = await Promise.all([
      this.prisma.meal.aggregate({
        where: { userId: id },
        _count: true,
        _avg: { calories: true, protein: true, carbs: true, fat: true },
      }),
      this.prisma.meal.findFirst({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      this.prisma.chatMessage.findFirst({
        where: { conversation: { userId: id } },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      this.prisma.meal.groupBy({
        by: ['date'],
        where: {
          userId: id,
          date: {
            gte: currentWindow('30d').start,
            lte: currentWindow('30d').end,
          },
        },
        _sum: { calories: true },
      }),
      this.prisma.aiRequestLog.aggregate({
        where: { userId: id },
        _count: true,
        _avg: { responseTimeMs: true },
      }),
      this.prisma.aiRequestLog.count({
        where: { userId: id, status: 'ERROR' },
      }),
      this.prisma.meal.findMany({
        where: { userId: id },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.meal.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: { id: true, name: true, mealType: true, createdAt: true },
      }),
      this.prisma.aiRequestLog.findMany({
        where: {
          userId: id,
          OR: [
            { status: 'ERROR' },
            { endpoint: 'RECOMMENDATION', status: 'SUCCESS' },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: {
          id: true,
          endpoint: true,
          status: true,
          errorReason: true,
          createdAt: true,
        },
      }),
    ]);

    const lastActiveCandidates = [
      user.lastLoginAt,
      lastMeal?.createdAt ?? null,
      lastChatMessage?.createdAt ?? null,
    ].filter((d): d is Date => d !== null);
    const lastActiveAt = lastActiveCandidates.length
      ? new Date(Math.max(...lastActiveCandidates.map((d) => d.getTime())))
      : null;

    const window30d = currentWindow('30d');
    const consumedByDate = new Map<string, number>();
    for (const row of calorieRows) {
      consumedByDate.set(formatDateOnly(row.date), row._sum.calories ?? 0);
    }
    const calorieHistory = eachDate(window30d).map((date) => ({
      date,
      value: consumedByDate.get(date) ?? 0,
    }));

    const mealActivity = recentMealsForActivity.map((meal) => ({
      type: 'MEAL_LOGGED' as const,
      label: `Logged ${meal.name} (${meal.mealType.toLowerCase()})`,
      createdAt: meal.createdAt,
    }));
    const aiActivity = recentAiForActivity.map((row) => ({
      type:
        row.status === 'ERROR'
          ? ('AI_REQUEST_FAILED' as const)
          : ('AI_RECOMMENDATION' as const),
      label:
        row.status === 'ERROR'
          ? `AI request failed${row.errorReason ? ` (${row.errorReason})` : ''}`
          : 'Received AI meal recommendations',
      createdAt: row.createdAt,
    }));
    const recentActivity = [...mealActivity, ...aiActivity]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 15)
      .map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }));

    await this.auditLogService.record({
      adminId,
      action: 'USER_VIEWED',
      targetType: 'User',
      targetId: id,
      ipAddress,
    });

    return {
      profile: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        age: user.age,
        heightCm: user.heightCm,
        weightKg: user.weightKg,
        goal: user.goal,
        activityLevel: user.activityLevel,
        dailyCalorieTarget: user.dailyCalorieTarget,
        language: user.language,
        theme: user.theme,
      },
      account: {
        email: user.email,
        telegramId: user.telegramId,
        authProvider: resolveAuthProvider(user.googleId, user.telegramId),
        createdAt: user.createdAt.toISOString(),
        lastActiveAt: lastActiveAt ? lastActiveAt.toISOString() : null,
        status: user.status,
      },
      nutrition: {
        mealsCount: mealAgg._count,
        avgCalories: Math.round(mealAgg._avg.calories ?? 0),
        avgProtein: Math.round((mealAgg._avg.protein ?? 0) * 10) / 10,
        avgCarbs: Math.round((mealAgg._avg.carbs ?? 0) * 10) / 10,
        avgFat: Math.round((mealAgg._avg.fat ?? 0) * 10) / 10,
      },
      calorieHistory,
      aiStats: {
        requestCount: aiAgg._count,
        failedCount: aiFailedCount,
        avgResponseTimeMs:
          aiAgg._avg.responseTimeMs != null
            ? Math.round(aiAgg._avg.responseTimeMs)
            : null,
      },
      recentMeals: recentMeals.map(toMealResponseDto),
      recentActivity,
    };
  }

  async updateStatus(
    id: string,
    status: 'ACTIVE' | 'DISABLED',
    adminId: string,
    ipAddress: string | null,
  ): Promise<{ id: string; status: 'ACTIVE' | 'DISABLED' }> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const previous = user.status;
    const updated = await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    await this.auditLogService.record({
      adminId,
      action: 'USER_STATUS_CHANGED',
      targetType: 'User',
      targetId: id,
      metadata: { from: previous, to: status },
      ipAddress,
    });

    return { id: updated.id, status: updated.status };
  }

  /** Permanently deletes a regular user and everything owned by them (meals,
   * workouts, chat history, ...) via the existing onDelete: Cascade FKs —
   * irreversible, so this never touches admin accounts (managed separately
   * via admin-team) or lets an admin delete themselves. The audit row is
   * written BEFORE the delete since targetId is a plain string, not an FK —
   * it deliberately outlives the deleted user as the only remaining record
   * the account ever existed. */
  async deleteUser(id: string, adminId: string, ipAddress: string | null): Promise<void> {
    if (id === adminId) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.adminRoleId) {
      throw new ForbiddenException('Cannot delete an admin account from here — remove their admin role first');
    }

    await this.auditLogService.record({
      adminId,
      action: 'USER_DELETED',
      targetType: 'User',
      targetId: id,
      metadata: { name: user.name, email: user.email },
      ipAddress,
    });

    await this.prisma.user.delete({ where: { id } });
  }

  async listFeatures(id: string): Promise<AdminUserFeatureDto[]> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.featureAccess.listForUser(id);
  }

  async grantFeature(
    id: string,
    feature: string,
    adminId: string,
    ipAddress: string | null,
  ): Promise<AdminUserFeatureDto[]> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.featureAccess.grant(id, feature, adminId);
    await this.auditLogService.record({
      adminId,
      action: 'USER_FEATURE_GRANTED',
      targetType: 'User',
      targetId: id,
      metadata: { feature },
      ipAddress,
    });
    return this.featureAccess.listForUser(id);
  }

  async revokeFeature(
    id: string,
    feature: string,
    adminId: string,
    ipAddress: string | null,
  ): Promise<AdminUserFeatureDto[]> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.featureAccess.revoke(id, feature);
    await this.auditLogService.record({
      adminId,
      action: 'USER_FEATURE_REVOKED',
      targetType: 'User',
      targetId: id,
      metadata: { feature },
      ipAddress,
    });
    return this.featureAccess.listForUser(id);
  }
}
