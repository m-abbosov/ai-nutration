import { Injectable } from '@nestjs/common';
import { Language } from '@prisma/client';
import { addDays, formatDateOnly, todayDateOnly } from '../common/date.util';
import { PrismaService } from '../database/prisma.service';
import {
  NutritionDailyDto,
  NutritionWeeklyPointDto,
} from '../nutrition/dto/nutrition-response.dto';
import { NutritionService } from '../nutrition/nutrition.service';

export interface DashboardResponseDto {
  daily: NutritionDailyDto;
  weekly: NutritionWeeklyPointDto[];
  insight: string | null;
  streakDays: number;
}

/**
 * Dashboard's AI insight is a DETERMINISTIC template, not a Gemini call.
 * Rationale (documented per the task brief's "your call, document which"):
 * the dashboard loads far more often than chat/recommendations (every app
 * open), so calling Gemini here would multiply AI spend for a low-value
 * one-liner and would also make the dashboard depend on GEMINI_API_KEY
 * being configured. A template keeps the dashboard fast, free, and fully
 * functional with no AI key at all, while still feeling personalized
 * since it reacts to today's actual consumed/remaining/macro numbers.
 */
function buildInsight(
  daily: NutritionDailyDto,
  language: Language,
): string | null {
  if (daily.target <= 0) return null; // onboarding not completed yet

  const pct = daily.target > 0 ? daily.consumed / daily.target : 0;
  const proteinPct =
    daily.protein.target > 0
      ? daily.protein.consumed / daily.protein.target
      : 0;

  const templates: Record<
    Language,
    (p: number, pp: number, remaining: number) => string
  > = {
    EN: (p, pp, remaining) => {
      if (daily.meals.length === 0) {
        return "You haven't logged any meals yet today — start with breakfast to stay on track.";
      }
      if (p < 0.5) {
        return `You're at ${Math.round(p * 100)}% of your calorie target with ${remaining} kcal left — plenty of room for balanced meals today.`;
      }
      if (p <= 1.0) {
        return pp < 0.7
          ? `Good progress — ${remaining} kcal remaining. Consider a protein-rich meal to hit your protein goal.`
          : `Nice work — you're on track with ${remaining} kcal remaining and solid protein intake today.`;
      }
      return `You've exceeded your calorie target by ${Math.abs(remaining)} kcal today — consider lighter choices for your next meal.`;
    },
    RU: (p, pp, remaining) => {
      if (daily.meals.length === 0) {
        return 'Вы ещё не отметили приёмы пищи сегодня — начните с завтрака.';
      }
      if (p < 0.5) {
        return `Вы использовали ${Math.round(p * 100)}% дневной нормы калорий, осталось ${remaining} ккал.`;
      }
      if (p <= 1.0) {
        return pp < 0.7
          ? `Хороший прогресс — осталось ${remaining} ккал. Добавьте белковый приём пищи.`
          : `Отлично — осталось ${remaining} ккал, с белком всё в порядке.`;
      }
      return `Вы превысили дневную норму на ${Math.abs(remaining)} ккал — выберите более лёгкий следующий приём пищи.`;
    },
    UZ: (p, pp, remaining) => {
      if (daily.meals.length === 0) {
        return "Bugun hali ovqat qo'shmadingiz — nonushtadan boshlang.";
      }
      if (p < 0.5) {
        return `Kunlik kaloriyangizning ${Math.round(p * 100)}% ini iste'mol qildingiz, ${remaining} kkal qoldi.`;
      }
      if (p <= 1.0) {
        return pp < 0.7
          ? `Yaxshi — ${remaining} kkal qoldi. Oqsilga boy taom qo'shishni o'ylab ko'ring.`
          : `Ajoyib — ${remaining} kkal qoldi va oqsil miqdori ham yaxshi.`;
      }
      return `Bugun kaloriya me'yorini ${Math.abs(remaining)} kkal ga oshirib yubordingiz — keyingi taomni yengilroq tanlang.`;
    },
  };

  return templates[language](pct, proteinPct, daily.remaining);
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nutritionService: NutritionService,
  ) {}

  private async computeStreakDays(userId: string): Promise<number> {
    const rows = await this.prisma.meal.findMany({
      where: { userId },
      select: { date: true },
      distinct: ['date'],
    });
    const dateSet = new Set(rows.map((row) => formatDateOnly(row.date)));

    let cursor = todayDateOnly();
    if (!dateSet.has(formatDateOnly(cursor))) {
      cursor = addDays(cursor, -1);
    }

    let streak = 0;
    while (dateSet.has(formatDateOnly(cursor))) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  async getDashboard(userId: string): Promise<DashboardResponseDto> {
    const [user, daily, weekly, streakDays] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.nutritionService.getDaily(userId),
      this.nutritionService.getWeekly(userId, 7),
      this.computeStreakDays(userId),
    ]);

    return {
      daily,
      weekly,
      insight: buildInsight(daily, user.language),
      streakDays,
    };
  }
}
