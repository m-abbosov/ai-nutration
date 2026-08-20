/**
 * DEV-ONLY seed data. Not used in production. Creates a single sample user
 * ("dev@nutriai.local") with realistic Uzbek foods (osh, mastava, somsa,
 * tovuq, grechka, qaynatilgan tuxum, greek yogurt, achichuk, olma, jo'xori)
 * across the last several days, so the dashboard/meals/progress screens
 * have believable data to render against during local development.
 *
 * Run with: npm run seed  (wraps `ts-node prisma/seed.ts`, also wired as
 * `prisma.seed` in package.json so `npx prisma db seed` works too).
 */
import {
  AdminPermissionKey,
  AdminRoleName,
  PrismaClient,
} from '@prisma/client';
import { calculateCalorieTargets } from '../src/users/calorie.util';

const prisma = new PrismaClient();

const DEV_USER_EMAIL = 'dev@nutriai.local';

// ── Admin panel (Phase 2) seed data ─────────────────────────────────────
// Fixed, seeded role set (docs/ADMIN_PANEL.md, "RBAC model"). Every key in
// AdminPermissionKey must appear exactly once across these descriptions so
// the idempotent upsert below stays exhaustive as the enum grows.
const ADMIN_PERMISSIONS: Record<AdminPermissionKey, string> = {
  DASHBOARD_READ: 'View the admin dashboard overview',
  USERS_READ: 'View regular user accounts and their detail pages',
  USERS_UPDATE: 'Edit regular user account fields',
  USERS_DISABLE: "Disable/re-enable a regular user's account",
  NUTRITION_READ: 'View aggregate nutrition analytics',
  AI_READ: 'View AI usage overview/analytics',
  AI_LOGS_READ: 'View individual AI request logs',
  CONVERSATIONS_READ: "View a user's chat conversation content",
  ANALYTICS_READ: 'View the analytics dashboard',
  SYSTEM_READ: 'View system health and error logs',
  ADMIN_USERS_READ: 'View admin team members and their roles',
  ADMIN_USERS_MANAGE: "Promote users to admin and manage admins' roles/access",
  SETTINGS_MANAGE: 'Change app settings and toggle feature flags',
  AUDIT_LOGS_READ: 'View the full admin audit log',
  USERS_DELETE: 'Permanently delete a regular user account and all their data',
  FEATURE_ACCESS_MANAGE: "Grant/revoke a regular user's access to gated features (e.g. Fitness)",
  FITNESS_READ: 'View aggregate fitness (workouts/exercises) analytics',
};

// Permission → role seed matrix (docs/ADMIN_PANEL.md). Data, not hardcoded
// logic — a SUPER_ADMIN could in principle extend this by seeding a new
// custom role row without a code change (per-admin overrides beyond these
// four roles are a deliberate follow-up, not built in Phase 2).
const ROLE_PERMISSIONS: Record<AdminRoleName, AdminPermissionKey[]> = {
  SUPER_ADMIN: Object.keys(ADMIN_PERMISSIONS) as AdminPermissionKey[],
  ADMIN: [
    'DASHBOARD_READ',
    'USERS_READ',
    'USERS_UPDATE',
    'USERS_DISABLE',
    'NUTRITION_READ',
    'FITNESS_READ',
    'AI_READ',
    'AI_LOGS_READ',
    'CONVERSATIONS_READ',
    'ANALYTICS_READ',
    'SYSTEM_READ',
    'FEATURE_ACCESS_MANAGE',
  ],
  MODERATOR: ['DASHBOARD_READ', 'USERS_READ', 'USERS_UPDATE', 'NUTRITION_READ'],
  SUPPORT: ['DASHBOARD_READ', 'USERS_READ'],
};

const FEATURE_FLAGS: {
  key: string;
  enabled: boolean;
  description: string;
}[] = [
  {
    key: 'AI_CHAT_ENABLED',
    enabled: true,
    description:
      'Whether the AI chat (nutrition coach) feature is available to users',
  },
  {
    key: 'RECOMMENDATIONS_ENABLED',
    enabled: true,
    description: 'Whether AI meal recommendations can be requested',
  },
  {
    key: 'GOOGLE_AUTH_ENABLED',
    enabled: true,
    description: 'Whether sign-in with Google is available',
  },
  {
    key: 'TELEGRAM_AUTH_ENABLED',
    enabled: true,
    description: 'Whether sign-in with the Telegram widget is available',
  },
  {
    key: 'MAINTENANCE_MODE',
    enabled: false,
    description:
      'When on, blocks regular user-facing endpoints with a 503 while admin/auth/health stay reachable',
  },
];

/** Idempotent — safe to re-run against a database that already has Phase 1
 * (or previously-seeded Phase 2) data, including production, per
 * docs/ADMIN_PANEL.md. Upserts on the unique AdminPermissionKey/
 * AdminRoleName/FeatureFlag.key. */
async function seedAdminPanel(devUserId: string): Promise<void> {
  console.log('Seeding admin panel roles/permissions/feature flags...');

  const permissionByKey = new Map<AdminPermissionKey, string>();
  for (const [key, description] of Object.entries(ADMIN_PERMISSIONS) as [
    AdminPermissionKey,
    string,
  ][]) {
    const permission = await prisma.adminPermission.upsert({
      where: { key },
      update: { description },
      create: { key, description },
    });
    permissionByKey.set(key, permission.id);
  }

  for (const [roleName, permissionKeys] of Object.entries(ROLE_PERMISSIONS) as [
    AdminRoleName,
    AdminPermissionKey[],
  ][]) {
    const role = await prisma.adminRole.upsert({
      where: { name: roleName },
      update: { isSystem: true },
      create: { name: roleName, isSystem: true },
    });

    // Rewrite the role's permission set to exactly match ROLE_PERMISSIONS —
    // makes re-running the seed after a matrix change converge instead of
    // only ever adding grants.
    const currentGrants = await prisma.adminRolePermission.findMany({
      where: { roleId: role.id },
      select: { permissionId: true },
    });
    const desiredPermissionIds = new Set(
      permissionKeys.map((key) => permissionByKey.get(key)!),
    );
    const currentPermissionIds = new Set(
      currentGrants.map((g) => g.permissionId),
    );

    const toAdd = [...desiredPermissionIds].filter(
      (id) => !currentPermissionIds.has(id),
    );
    const toRemove = [...currentPermissionIds].filter(
      (id) => !desiredPermissionIds.has(id),
    );

    if (toAdd.length) {
      await prisma.adminRolePermission.createMany({
        data: toAdd.map((permissionId) => ({ roleId: role.id, permissionId })),
        skipDuplicates: true,
      });
    }
    if (toRemove.length) {
      await prisma.adminRolePermission.deleteMany({
        where: { roleId: role.id, permissionId: { in: toRemove } },
      });
    }

    if (roleName === 'SUPER_ADMIN') {
      await prisma.user.update({
        where: { id: devUserId },
        data: { adminRoleId: role.id, adminActive: true },
      });
    }
  }

  for (const flag of FEATURE_FLAGS) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: { description: flag.description },
      create: {
        key: flag.key,
        enabled: flag.enabled,
        description: flag.description,
      },
    });
  }

  console.log(
    'Seeded admin roles, permissions, feature flags; promoted dev user to SUPER_ADMIN.',
  );
}

interface SeedMealItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface SeedMeal {
  mealType: 'BREAKFAST' | 'LUNCH' | 'SNACK' | 'DINNER';
  name: string;
  emoji: string;
  servingSize: string;
  items: SeedMealItem[];
}

// Realistic-ish Uzbek food nutrition estimates (per typical serving).
const OSH: SeedMealItem = {
  name: 'Osh (Plov)',
  quantity: '1 plate (~350g)',
  calories: 650,
  protein: 22,
  carbs: 78,
  fat: 26,
};
const MASTAVA: SeedMealItem = {
  name: 'Mastava',
  quantity: '1 bowl (~300ml)',
  calories: 220,
  protein: 10,
  carbs: 24,
  fat: 9,
};
const SOMSA: SeedMealItem = {
  name: 'Somsa',
  quantity: '1 piece (~120g)',
  calories: 310,
  protein: 12,
  carbs: 28,
  fat: 17,
};
const TOVUQ: SeedMealItem = {
  name: "Tovuq go'shti (grilled chicken)",
  quantity: '150g',
  calories: 250,
  protein: 38,
  carbs: 0,
  fat: 10,
};
const GRECHKA: SeedMealItem = {
  name: 'Grechka (buckwheat)',
  quantity: '1 cup cooked (~180g)',
  calories: 190,
  protein: 7,
  carbs: 38,
  fat: 2,
};
const TUXUM: SeedMealItem = {
  name: 'Qaynatilgan tuxum (boiled egg)',
  quantity: '2 eggs',
  calories: 155,
  protein: 13,
  carbs: 1,
  fat: 11,
};
const YOGURT: SeedMealItem = {
  name: 'Greek yogurt',
  quantity: '200g',
  calories: 130,
  protein: 18,
  carbs: 8,
  fat: 3,
};
const ACHICHUK: SeedMealItem = {
  name: 'Achichuk salad',
  quantity: '1 bowl (~200g)',
  calories: 60,
  protein: 2,
  carbs: 12,
  fat: 1,
};
const OLMA: SeedMealItem = {
  name: 'Olma (apple)',
  quantity: '1 medium',
  calories: 95,
  protein: 0.5,
  carbs: 25,
  fat: 0.3,
};
const JOXORI: SeedMealItem = {
  name: "Jo'xori (corn)",
  quantity: '1 ear',
  calories: 120,
  protein: 4,
  carbs: 27,
  fat: 1.5,
};

function meal(
  mealType: SeedMeal['mealType'],
  emoji: string,
  items: SeedMealItem[],
  nameOverride?: string,
): SeedMeal {
  const totalCalories = items.reduce((a, i) => a + i.calories, 0);
  return {
    mealType,
    emoji,
    name: nameOverride ?? items.map((i) => i.name).join(' + '),
    servingSize: items.length > 1 ? `${items.length} items` : items[0].quantity,
    items,
  };
}

// One realistic day of Uzbek eating, reused with slight variation across days.
const DAY_TEMPLATES: SeedMeal[][] = [
  [
    meal('BREAKFAST', '🍳', [TUXUM, YOGURT]),
    meal('LUNCH', '🍚', [OSH, ACHICHUK]),
    meal('SNACK', '🍎', [OLMA]),
    meal('DINNER', '🍲', [MASTAVA, SOMSA]),
  ],
  [
    meal('BREAKFAST', '🥣', [GRECHKA, YOGURT]),
    meal('LUNCH', '🍗', [TOVUQ, GRECHKA, ACHICHUK]),
    meal('SNACK', '🌽', [JOXORI]),
    meal('DINNER', '🥟', [SOMSA, ACHICHUK]),
  ],
  [
    meal('BREAKFAST', '🥚', [TUXUM, OLMA]),
    meal('LUNCH', '🍚', [OSH]),
    meal('DINNER', '🍜', [MASTAVA, TOVUQ]),
  ],
];

function sumTotals(items: SeedMealItem[]) {
  return items.reduce(
    (acc, i) => ({
      calories: acc.calories + i.calories,
      protein: acc.protein + i.protein,
      carbs: acc.carbs + i.carbs,
      fat: acc.fat + i.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

function dateOnlyDaysAgo(daysAgo: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - daysAgo,
    ),
  );
}

async function main() {
  console.log('Seeding dev-only NutriAI data...');

  const targets = calculateCalorieTargets({
    age: 27,
    heightCm: 178,
    weightKg: 74,
    gender: 'MALE',
    activityLevel: 'MODERATE',
    goal: 'LOSE',
  });

  const user = await prisma.user.upsert({
    where: { email: DEV_USER_EMAIL },
    update: {},
    create: {
      email: DEV_USER_EMAIL,
      name: 'Dev User',
      avatarUrl: null,
      age: 27,
      heightCm: 178,
      weightKg: 74,
      goalWeightKg: 68,
      gender: 'MALE',
      activityLevel: 'MODERATE',
      goal: 'LOSE',
      dailyCalorieTarget: targets.dailyCalorieTarget,
      proteinTargetG: targets.proteinTargetG,
      carbsTargetG: targets.carbsTargetG,
      fatTargetG: targets.fatTargetG,
      language: 'UZ',
      theme: 'DARK',
      onboardingCompletedAt: new Date(),
    },
  });

  // Clean any previously seeded meals for this user so the script is
  // re-runnable without duplicating rows.
  await prisma.meal.deleteMany({ where: { userId: user.id } });

  const DAYS_OF_HISTORY = 6; // today + 5 previous days
  for (let daysAgo = DAYS_OF_HISTORY - 1; daysAgo >= 0; daysAgo--) {
    const date = dateOnlyDaysAgo(daysAgo);
    const template = DAY_TEMPLATES[daysAgo % DAY_TEMPLATES.length];

    for (const seedMeal of template) {
      const totals = sumTotals(seedMeal.items);
      await prisma.meal.create({
        data: {
          userId: user.id,
          date,
          mealType: seedMeal.mealType,
          name: seedMeal.name,
          emoji: seedMeal.emoji,
          servingSize: seedMeal.servingSize,
          source: 'MANUAL',
          calories: Math.round(totals.calories),
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat,
          items: {
            create: seedMeal.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              calories: Math.round(item.calories),
              protein: item.protein,
              carbs: item.carbs,
              fat: item.fat,
            })),
          },
        },
      });
    }
  }

  const mealCount = await prisma.meal.count({ where: { userId: user.id } });
  console.log(
    `Seeded user ${user.email} (${user.id}) with ${mealCount} meals across ${DAYS_OF_HISTORY} days.`,
  );

  await seedAdminPanel(user.id);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
