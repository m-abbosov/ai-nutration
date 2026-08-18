import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { addDays, parseDateOnly, todayDateOnly } from '../common/date.util';
import { CreateMealDto } from './dto/create-meal.dto';
import { MealItemInputDto } from './dto/meal-item-input.dto';
import { MealResponseDto } from './dto/meal-response.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { toMealResponseDto } from './meals.mapper';

function sumItems(items: MealItemInputDto[]) {
  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
  };
}

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
export class MealsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByDate(
    userId: string,
    dateStr?: string,
  ): Promise<MealResponseDto[]> {
    const date = dateStr ? safeParseDate(dateStr) : todayDateOnly();

    const meals = await this.prisma.meal.findMany({
      where: { userId, date },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });

    return meals.map(toMealResponseDto);
  }

  /** Last `days` calendar days (including today), most recent first — used
   * to give the AI coach a bounded, id-bearing list of meals it may
   * reference when the user asks to correct/edit something already logged. */
  async findRecent(userId: string, days = 7): Promise<MealResponseDto[]> {
    const since = addDays(todayDateOnly(), -(days - 1));

    const meals = await this.prisma.meal.findMany({
      where: { userId, date: { gte: since } },
      include: { items: true },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 40,
    });

    return meals.map(toMealResponseDto);
  }

  private async findOwnedOrThrow(userId: string, mealId: string) {
    const meal = await this.prisma.meal.findUnique({
      where: { id: mealId },
      include: { items: true },
    });
    if (!meal) throw new NotFoundException('Meal not found');
    if (meal.userId !== userId) {
      throw new ForbiddenException('You do not have access to this meal');
    }
    return meal;
  }

  async create(userId: string, dto: CreateMealDto): Promise<MealResponseDto> {
    const source = dto.source ?? 'MANUAL';
    const date = dto.date ? safeParseDate(dto.date) : todayDateOnly();

    let totals: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    let items: MealItemInputDto[] = [];

    if (source === 'AI') {
      // Never trust an AI/client-supplied aggregate — recompute from items.
      items = dto.items ?? [];
      if (items.length === 0) {
        throw new BadRequestException(
          'AI-sourced meals require at least one item',
        );
      }
      totals = sumItems(items);
    } else {
      if (
        dto.calories === undefined ||
        dto.protein === undefined ||
        dto.carbs === undefined ||
        dto.fat === undefined
      ) {
        throw new BadRequestException(
          'calories, protein, carbs and fat are required for manual meal entries',
        );
      }
      totals = {
        calories: dto.calories,
        protein: dto.protein,
        carbs: dto.carbs,
        fat: dto.fat,
      };
    }

    const meal = await this.prisma.meal.create({
      data: {
        userId,
        date,
        mealType: dto.mealType,
        name: dto.name,
        emoji: dto.emoji ?? null,
        servingSize: dto.servingSize ?? null,
        source,
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        items: {
          create: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            calories: Math.round(item.calories),
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
          })),
        },
      },
      include: { items: true },
    });

    return toMealResponseDto(meal);
  }

  async update(
    userId: string,
    mealId: string,
    dto: UpdateMealDto,
  ): Promise<MealResponseDto> {
    await this.findOwnedOrThrow(userId, mealId);

    let totals:
      | { calories: number; protein: number; carbs: number; fat: number }
      | undefined;

    if (dto.items) {
      totals = sumItems(dto.items);
      await this.prisma.mealItem.deleteMany({ where: { mealId } });
    } else if (
      dto.calories !== undefined ||
      dto.protein !== undefined ||
      dto.carbs !== undefined ||
      dto.fat !== undefined
    ) {
      totals = {
        calories: dto.calories ?? undefined,
        protein: dto.protein ?? undefined,
        carbs: dto.carbs ?? undefined,
        fat: dto.fat ?? undefined,
      } as { calories: number; protein: number; carbs: number; fat: number };
    }

    const meal = await this.prisma.meal.update({
      where: { id: mealId },
      data: {
        mealType: dto.mealType,
        name: dto.name,
        emoji: dto.emoji,
        servingSize: dto.servingSize,
        date: dto.date ? safeParseDate(dto.date) : undefined,
        calories: totals?.calories,
        protein: totals?.protein,
        carbs: totals?.carbs,
        fat: totals?.fat,
        items: dto.items
          ? {
              create: dto.items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                calories: Math.round(item.calories),
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });

    return toMealResponseDto(meal);
  }

  async remove(userId: string, mealId: string): Promise<void> {
    await this.findOwnedOrThrow(userId, mealId);
    await this.prisma.meal.delete({ where: { id: mealId } });
  }
}
