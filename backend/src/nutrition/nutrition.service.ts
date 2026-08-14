import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  addDays,
  formatDateOnly,
  parseDateOnly,
  todayDateOnly,
} from '../common/date.util';
import { toMealResponseDto } from '../meals/meals.mapper';
import {
  NutritionDailyDto,
  NutritionWeeklyPointDto,
} from './dto/nutrition-response.dto';

function safeParseDate(value: string): Date {
  try {
    return parseDateOnly(value);
  } catch {
    throw new BadRequestException(
      `Invalid date "${value}", expected YYYY-MM-DD`,
    );
  }
}

@Injectable()
export class NutritionService {
  constructor(private readonly prisma: PrismaService) {}

  async getDaily(userId: string, dateStr?: string): Promise<NutritionDailyDto> {
    const date = dateStr ? safeParseDate(dateStr) : todayDateOnly();

    const [user, meals] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.prisma.meal.findMany({
        where: { userId, date },
        include: { items: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const consumed = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const target = user.dailyCalorieTarget ?? 0;

    return {
      date: formatDateOnly(date),
      target,
      consumed: Math.round(consumed.calories),
      remaining: Math.round(target - consumed.calories),
      protein: {
        consumed: Math.round(consumed.protein * 10) / 10,
        target: user.proteinTargetG ?? 0,
      },
      carbs: {
        consumed: Math.round(consumed.carbs * 10) / 10,
        target: user.carbsTargetG ?? 0,
      },
      fat: {
        consumed: Math.round(consumed.fat * 10) / 10,
        target: user.fatTargetG ?? 0,
      },
      meals: meals.map(toMealResponseDto),
    };
  }

  async getWeekly(
    userId: string,
    days = 7,
  ): Promise<NutritionWeeklyPointDto[]> {
    const boundedDays = Math.min(Math.max(days, 1), 90);
    const today = todayDateOnly();
    const start = addDays(today, -(boundedDays - 1));

    const [user, grouped] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.prisma.meal.groupBy({
        by: ['date'],
        where: { userId, date: { gte: start, lte: today } },
        _sum: { calories: true },
      }),
    ]);

    const consumedByDate = new Map<string, number>();
    for (const row of grouped) {
      consumedByDate.set(formatDateOnly(row.date), row._sum.calories ?? 0);
    }

    const target = user.dailyCalorieTarget ?? 0;
    const points: NutritionWeeklyPointDto[] = [];
    for (let i = 0; i < boundedDays; i++) {
      const date = addDays(start, i);
      const dateStr = formatDateOnly(date);
      points.push({
        date: dateStr,
        label: date.toLocaleDateString('en-US', {
          weekday: 'short',
          timeZone: 'UTC',
        }),
        consumed: consumedByDate.get(dateStr) ?? 0,
        target,
      });
    }
    return points;
  }
}
