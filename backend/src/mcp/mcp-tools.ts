import { McpServer } from '@modelcontextprotocol/server';
import { ActivityLevel, Gender, Goal, MealType } from '@prisma/client';
import { z } from 'zod';
import { MealsService } from '../meals/meals.service';
import { NutritionService } from '../nutrition/nutrition.service';
import { RecommendationsService } from '../recommendations/recommendations.service';
import { UsersService } from '../users/users.service';

const mealItemSchema = z.object({
  name: z.string().min(1).max(120),
  quantity: z.string().max(60),
  calories: z.number().min(0).max(5000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(500),
  fat: z.number().min(0).max(500),
});

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
  .optional()
  .describe('Date in YYYY-MM-DD format, defaults to today');

/**
 * Registers every tool NutriAI exposes to a connected MCP client (Claude,
 * ChatGPT, ...) onto a fresh `McpServer` instance, scoped to one NutriAI
 * user (`accountId`). Mirrors the full in-app AI Coach capability — meal
 * CRUD, nutrition/profile reads, recommendations — per the user's chosen
 * "full" tool scope, all reusing the exact same services the REST API and
 * in-app AI Coach already call, so behavior (validation, targets math,
 * AI-key error handling) never diverges between surfaces.
 */
export function buildMcpServer(
  accountId: string,
  services: {
    meals: MealsService;
    nutrition: NutritionService;
    users: UsersService;
    recommendations: RecommendationsService;
  },
): McpServer {
  const server = new McpServer({ name: 'nutriai', version: '1.0.0' });

  server.registerTool(
    'get_profile',
    {
      title: 'Get profile',
      description:
        "Get the user's NutriAI profile: body metrics, goal, activity level, and daily calorie/macro targets.",
    },
    async () => {
      const profile = await services.users.getMe(accountId);
      return {
        content: [{ type: 'text', text: JSON.stringify(profile, null, 2) }],
      };
    },
  );

  server.registerTool(
    'update_profile',
    {
      title: 'Update profile',
      description:
        "Update the user's body metrics, goal, or activity level. Daily calorie/macro targets are automatically recalculated when these change.",
      inputSchema: z.object({
        name: z.string().min(1).max(120).optional(),
        age: z.number().int().min(13).max(120).optional(),
        heightCm: z.number().min(50).max(272).optional(),
        weightKg: z.number().min(20).max(500).optional(),
        goalWeightKg: z.number().min(20).max(500).optional(),
        gender: z.nativeEnum(Gender).optional(),
        activityLevel: z.nativeEnum(ActivityLevel).optional(),
        goal: z.nativeEnum(Goal).optional(),
      }),
    },
    async (input) => {
      const profile = await services.users.updateMe(accountId, input);
      return {
        content: [{ type: 'text', text: JSON.stringify(profile, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_daily_nutrition',
    {
      title: 'Get daily nutrition',
      description:
        "Get the user's calorie/macro targets, what they've consumed, and the meals logged for a given day (defaults to today).",
      inputSchema: z.object({ date: dateSchema }),
    },
    async ({ date }) => {
      const daily = await services.nutrition.getDaily(accountId, date);
      return {
        content: [{ type: 'text', text: JSON.stringify(daily, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_recent_meals',
    {
      title: 'Get recent meals',
      description:
        'List the meals the user logged over the last N days (default 7, max 90), most recent first — use this to find a mealId before editing or deleting.',
      inputSchema: z.object({
        days: z.number().int().min(1).max(90).optional(),
      }),
    },
    async ({ days }) => {
      const meals = await services.meals.findRecent(accountId, days);
      return {
        content: [{ type: 'text', text: JSON.stringify(meals, null, 2) }],
      };
    },
  );

  server.registerTool(
    'log_meal',
    {
      title: 'Log a meal',
      description:
        "Log a meal the user ate, broken down into individual food items with your own estimated calories/macros per item — the meal's totals are computed from them.",
      inputSchema: z.object({
        mealType: z.nativeEnum(MealType),
        name: z.string().min(1).max(120),
        emoji: z.string().max(8).optional(),
        servingSize: z.string().max(60).optional(),
        date: dateSchema,
        items: z.array(mealItemSchema).min(1),
      }),
    },
    async (input) => {
      const meal = await services.meals.create(accountId, {
        ...input,
        source: 'AI',
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(meal, null, 2) }],
      };
    },
  );

  server.registerTool(
    'update_meal',
    {
      title: 'Update a meal',
      description:
        "Update a previously logged meal by id (see get_recent_meals). Only the fields you provide are changed; providing `items` replaces the meal's food items and recomputes its totals.",
      inputSchema: z.object({
        mealId: z.string().min(1),
        mealType: z.nativeEnum(MealType).optional(),
        name: z.string().min(1).max(120).optional(),
        emoji: z.string().max(8).optional(),
        servingSize: z.string().max(60).optional(),
        date: dateSchema,
        items: z.array(mealItemSchema).min(1).optional(),
      }),
    },
    async ({ mealId, ...changes }) => {
      const meal = await services.meals.update(accountId, mealId, changes);
      return {
        content: [{ type: 'text', text: JSON.stringify(meal, null, 2) }],
      };
    },
  );

  server.registerTool(
    'delete_meal',
    {
      title: 'Delete a meal',
      description:
        'Delete a previously logged meal by id (see get_recent_meals).',
      inputSchema: z.object({ mealId: z.string().min(1) }),
    },
    async ({ mealId }) => {
      await services.meals.remove(accountId, mealId);
      return { content: [{ type: 'text', text: 'Meal deleted.' }] };
    },
  );

  server.registerTool(
    'get_recommendations',
    {
      title: 'Get AI meal recommendations',
      description:
        "Get personalized meal recommendations from NutriAI's own recommendation engine, based on the user's remaining calories/macros for today. Requires the user to have an AI key configured in NutriAI Settings — if this fails asking them to add one there.",
      inputSchema: z.object({ mealType: z.nativeEnum(MealType).optional() }),
    },
    async ({ mealType }) => {
      const result = await services.recommendations.generate(accountId, {
        mealType,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  return server;
}
