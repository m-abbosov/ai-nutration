/**
 * Production-safe exercise catalog seed — NOT dev-only sample data (contrast
 * with prisma/seed.ts, which is explicitly dev-only fixture data). This is the
 * real reference catalog every environment needs for the AI workout parser
 * (exercise-matcher.util.ts) and the fitness dashboard to function at all.
 *
 * Idempotent: every write is an upsert keyed on a stable natural key (muscle
 * code, exercise slug, or (language, normalized) alias key), so this is safe
 * to rerun any time the catalog grows.
 *
 * Run with: npm run seed:exercises
 */
import { ExerciseCategory, Language, MuscleCode, MuscleRegion, MuscleRole, PrismaClient } from '@prisma/client';
import { normalizeExerciseText } from '../src/fitness/lib/normalize-text.util';

const prisma = new PrismaClient();

const MUSCLE_GROUPS: { code: MuscleCode; region: MuscleRegion; sortOrder: number }[] = [
  { code: 'CHEST', region: 'FRONT', sortOrder: 1 },
  { code: 'UPPER_CHEST', region: 'FRONT', sortOrder: 2 },
  { code: 'SHOULDERS', region: 'BOTH', sortOrder: 3 },
  { code: 'FRONT_DELTS', region: 'FRONT', sortOrder: 4 },
  { code: 'SIDE_DELTS', region: 'BOTH', sortOrder: 5 },
  { code: 'REAR_DELTS', region: 'BACK', sortOrder: 6 },
  { code: 'BICEPS', region: 'FRONT', sortOrder: 7 },
  { code: 'TRICEPS', region: 'BACK', sortOrder: 8 },
  { code: 'FOREARMS', region: 'BOTH', sortOrder: 9 },
  { code: 'ABS', region: 'FRONT', sortOrder: 10 },
  { code: 'OBLIQUES', region: 'FRONT', sortOrder: 11 },
  { code: 'BACK', region: 'BACK', sortOrder: 12 },
  { code: 'LATS', region: 'BACK', sortOrder: 13 },
  { code: 'TRAPS', region: 'BACK', sortOrder: 14 },
  { code: 'GLUTES', region: 'BACK', sortOrder: 15 },
  { code: 'QUADS', region: 'FRONT', sortOrder: 16 },
  { code: 'HAMSTRINGS', region: 'BACK', sortOrder: 17 },
  { code: 'CALVES', region: 'BOTH', sortOrder: 18 },
];

interface AliasSeed {
  language: Language;
  alias: string;
  isPrimary?: boolean;
}

interface ExerciseSeed {
  slug: string;
  category: ExerciseCategory;
  equipment: string | null;
  primaryMuscle: MuscleCode;
  secondaryMuscles?: { muscle: MuscleCode; weight: number }[];
  aliases: AliasSeed[];
}

// Primary alias per language is the canonical UI display name for the exercise
// (Exercise itself has no name field — see schema.prisma doc comment on
// ExerciseAlias.isPrimary). Extra non-primary aliases are real synonyms users
// actually type, sourced from the original brief's own examples plus common
// gym slang, so the AI parser + exercise-matcher have real signal to match on.
const EXERCISES: ExerciseSeed[] = [
  {
    slug: 'bench-press', category: 'COMPOUND', equipment: 'barbell', primaryMuscle: 'CHEST',
    secondaryMuscles: [{ muscle: 'TRICEPS', weight: 0.4 }, { muscle: 'FRONT_DELTS', weight: 0.3 }],
    aliases: [
      { language: 'EN', alias: 'Bench Press', isPrimary: true }, { language: 'EN', alias: 'Bench' },
      { language: 'RU', alias: 'Жим лёжа', isPrimary: true }, { language: 'RU', alias: 'Жим штанги лежа' },
      { language: 'UZ', alias: 'Bench press', isPrimary: true }, { language: 'UZ', alias: "Ko'krak jimi" },
    ],
  },
  {
    slug: 'incline-bench-press', category: 'COMPOUND', equipment: 'barbell', primaryMuscle: 'UPPER_CHEST',
    secondaryMuscles: [{ muscle: 'FRONT_DELTS', weight: 0.4 }, { muscle: 'TRICEPS', weight: 0.3 }],
    aliases: [
      { language: 'EN', alias: 'Incline Bench Press', isPrimary: true }, { language: 'EN', alias: 'Incline Bench' },
      { language: 'RU', alias: 'Жим лёжа на наклонной скамье', isPrimary: true },
      { language: 'UZ', alias: 'Incline bench press', isPrimary: true },
    ],
  },
  {
    slug: 'push-up', category: 'BODYWEIGHT', equipment: 'bodyweight', primaryMuscle: 'CHEST',
    secondaryMuscles: [{ muscle: 'TRICEPS', weight: 0.3 }, { muscle: 'FRONT_DELTS', weight: 0.2 }],
    aliases: [
      { language: 'EN', alias: 'Push-up', isPrimary: true }, { language: 'EN', alias: 'Pushup' },
      { language: 'RU', alias: 'Отжимания', isPrimary: true },
      { language: 'UZ', alias: 'Otjimaniya', isPrimary: true }, { language: 'UZ', alias: "Ko'krakdan tortib turish" },
    ],
  },
  {
    slug: 'dumbbell-fly', category: 'ISOLATION', equipment: 'dumbbell', primaryMuscle: 'CHEST',
    secondaryMuscles: [{ muscle: 'UPPER_CHEST', weight: 0.3 }],
    aliases: [
      { language: 'EN', alias: 'Dumbbell Fly', isPrimary: true }, { language: 'EN', alias: 'Chest Fly' },
      { language: 'RU', alias: 'Разведение гантелей лёжа', isPrimary: true },
      { language: 'UZ', alias: 'Gantel fly', isPrimary: true },
    ],
  },
  {
    slug: 'cable-crossover', category: 'ISOLATION', equipment: 'cable', primaryMuscle: 'CHEST',
    aliases: [
      { language: 'EN', alias: 'Cable Crossover', isPrimary: true }, { language: 'EN', alias: 'Cable Fly' },
      { language: 'RU', alias: 'Сведение рук в кроссовере', isPrimary: true },
      { language: 'UZ', alias: 'Cable crossover', isPrimary: true },
    ],
  },
  {
    slug: 'dips', category: 'COMPOUND', equipment: 'bodyweight', primaryMuscle: 'CHEST',
    secondaryMuscles: [{ muscle: 'TRICEPS', weight: 0.4 }, { muscle: 'FRONT_DELTS', weight: 0.2 }],
    aliases: [
      { language: 'EN', alias: 'Dips', isPrimary: true }, { language: 'EN', alias: 'Chest Dips' },
      { language: 'RU', alias: 'Отжимания на брусьях', isPrimary: true },
      { language: 'UZ', alias: 'Brusda otjimaniya', isPrimary: true },
    ],
  },
  {
    slug: 'pull-up', category: 'COMPOUND', equipment: 'bodyweight', primaryMuscle: 'LATS',
    secondaryMuscles: [{ muscle: 'BICEPS', weight: 0.4 }, { muscle: 'BACK', weight: 0.3 }],
    aliases: [
      { language: 'EN', alias: 'Pull-up', isPrimary: true }, { language: 'EN', alias: 'Pullup' }, { language: 'EN', alias: 'Chin-up' },
      { language: 'RU', alias: 'Подтягивания', isPrimary: true },
      { language: 'UZ', alias: 'Turnikda tortilish', isPrimary: true }, { language: 'UZ', alias: 'Pull-up' },
    ],
  },
  {
    slug: 'lat-pulldown', category: 'COMPOUND', equipment: 'cable', primaryMuscle: 'LATS',
    secondaryMuscles: [{ muscle: 'BICEPS', weight: 0.3 }],
    aliases: [
      { language: 'EN', alias: 'Lat Pulldown', isPrimary: true }, { language: 'EN', alias: 'Pulldown' },
      { language: 'RU', alias: 'Тяга верхнего блока', isPrimary: true },
      { language: 'UZ', alias: 'Lat pulldown', isPrimary: true }, { language: 'UZ', alias: 'Yuqori blok tortish' },
    ],
  },
  {
    slug: 'barbell-row', category: 'COMPOUND', equipment: 'barbell', primaryMuscle: 'BACK',
    secondaryMuscles: [{ muscle: 'LATS', weight: 0.4 }, { muscle: 'BICEPS', weight: 0.3 }],
    aliases: [
      { language: 'EN', alias: 'Barbell Row', isPrimary: true }, { language: 'EN', alias: 'Bent-over Row' },
      { language: 'RU', alias: 'Тяга штанги в наклоне', isPrimary: true },
      { language: 'UZ', alias: "Shtanga bilan qiya tortish", isPrimary: true },
    ],
  },
  {
    slug: 'seated-cable-row', category: 'COMPOUND', equipment: 'cable', primaryMuscle: 'BACK',
    secondaryMuscles: [{ muscle: 'LATS', weight: 0.3 }, { muscle: 'BICEPS', weight: 0.2 }],
    aliases: [
      { language: 'EN', alias: 'Seated Cable Row', isPrimary: true }, { language: 'EN', alias: 'Cable Row' },
      { language: 'RU', alias: 'Тяга нижнего блока сидя', isPrimary: true },
      { language: 'UZ', alias: "O'tirib pastki blok tortish", isPrimary: true },
    ],
  },
  {
    slug: 'deadlift', category: 'COMPOUND', equipment: 'barbell', primaryMuscle: 'BACK',
    secondaryMuscles: [{ muscle: 'HAMSTRINGS', weight: 0.5 }, { muscle: 'GLUTES', weight: 0.4 }, { muscle: 'TRAPS', weight: 0.3 }],
    aliases: [
      { language: 'EN', alias: 'Deadlift', isPrimary: true },
      { language: 'RU', alias: 'Становая тяга', isPrimary: true },
      { language: 'UZ', alias: 'Stanovaya tyaga', isPrimary: true }, { language: 'UZ', alias: "Yerdan ko'tarish" },
    ],
  },
  {
    slug: 't-bar-row', category: 'COMPOUND', equipment: 'barbell', primaryMuscle: 'BACK',
    secondaryMuscles: [{ muscle: 'LATS', weight: 0.4 }],
    aliases: [
      { language: 'EN', alias: 'T-Bar Row', isPrimary: true },
      { language: 'RU', alias: 'Тяга Т-грифа', isPrimary: true },
      { language: 'UZ', alias: 'T-bar row', isPrimary: true },
    ],
  },
  {
    slug: 'shrug', category: 'ISOLATION', equipment: 'dumbbell', primaryMuscle: 'TRAPS',
    aliases: [
      { language: 'EN', alias: 'Shrug', isPrimary: true }, { language: 'EN', alias: 'Shoulder Shrug' },
      { language: 'RU', alias: 'Шраги', isPrimary: true },
      { language: 'UZ', alias: 'Shrug', isPrimary: true }, { language: 'UZ', alias: "Yelka ko'tarish" },
    ],
  },
  {
    slug: 'face-pull', category: 'ISOLATION', equipment: 'cable', primaryMuscle: 'REAR_DELTS',
    secondaryMuscles: [{ muscle: 'TRAPS', weight: 0.3 }],
    aliases: [
      { language: 'EN', alias: 'Face Pull', isPrimary: true },
      { language: 'RU', alias: 'Тяга к лицу', isPrimary: true },
      { language: 'UZ', alias: 'Face pull', isPrimary: true },
    ],
  },
  {
    slug: 'shoulder-press', category: 'COMPOUND', equipment: 'dumbbell', primaryMuscle: 'SHOULDERS',
    secondaryMuscles: [{ muscle: 'FRONT_DELTS', weight: 0.4 }, { muscle: 'TRICEPS', weight: 0.3 }],
    aliases: [
      { language: 'EN', alias: 'Shoulder Press', isPrimary: true }, { language: 'EN', alias: 'Overhead Press' }, { language: 'EN', alias: 'OHP' },
      { language: 'RU', alias: 'Жим гантелей сидя', isPrimary: true }, { language: 'RU', alias: 'Жим над головой' },
      { language: 'UZ', alias: 'Yelka pressi', isPrimary: true }, { language: 'UZ', alias: 'Shoulder press' },
    ],
  },
  {
    slug: 'arnold-press', category: 'COMPOUND', equipment: 'dumbbell', primaryMuscle: 'SHOULDERS',
    secondaryMuscles: [{ muscle: 'FRONT_DELTS', weight: 0.3 }, { muscle: 'SIDE_DELTS', weight: 0.3 }],
    aliases: [
      { language: 'EN', alias: 'Arnold Press', isPrimary: true },
      { language: 'RU', alias: 'Жим Арнольда', isPrimary: true },
      { language: 'UZ', alias: 'Arnold press', isPrimary: true },
    ],
  },
  {
    slug: 'lateral-raise', category: 'ISOLATION', equipment: 'dumbbell', primaryMuscle: 'SIDE_DELTS',
    aliases: [
      { language: 'EN', alias: 'Lateral Raise', isPrimary: true }, { language: 'EN', alias: 'Side Raise' },
      { language: 'RU', alias: 'Махи гантелями в стороны', isPrimary: true },
      { language: 'UZ', alias: "Yon ko'tarish", isPrimary: true }, { language: 'UZ', alias: 'Lateral raise' },
    ],
  },
  {
    slug: 'front-raise', category: 'ISOLATION', equipment: 'dumbbell', primaryMuscle: 'FRONT_DELTS',
    aliases: [
      { language: 'EN', alias: 'Front Raise', isPrimary: true },
      { language: 'RU', alias: 'Подъём гантелей перед собой', isPrimary: true },
      { language: 'UZ', alias: "Oldinga ko'tarish", isPrimary: true },
    ],
  },
  {
    slug: 'rear-delt-fly', category: 'ISOLATION', equipment: 'dumbbell', primaryMuscle: 'REAR_DELTS',
    aliases: [
      { language: 'EN', alias: 'Rear Delt Fly', isPrimary: true }, { language: 'EN', alias: 'Reverse Fly' },
      { language: 'RU', alias: 'Разведение гантелей в наклоне', isPrimary: true },
      { language: 'UZ', alias: 'Rear delt fly', isPrimary: true },
    ],
  },
  {
    slug: 'barbell-curl', category: 'ISOLATION', equipment: 'barbell', primaryMuscle: 'BICEPS',
    aliases: [
      { language: 'EN', alias: 'Barbell Curl', isPrimary: true },
      { language: 'RU', alias: 'Подъём штанги на бицепс', isPrimary: true },
      { language: 'UZ', alias: 'Shtanga bilan bitseps', isPrimary: true },
    ],
  },
  {
    slug: 'dumbbell-curl', category: 'ISOLATION', equipment: 'dumbbell', primaryMuscle: 'BICEPS',
    aliases: [
      { language: 'EN', alias: 'Dumbbell Curl', isPrimary: true }, { language: 'EN', alias: 'Bicep Curl' },
      { language: 'RU', alias: 'Подъём гантелей на бицепс', isPrimary: true },
      { language: 'UZ', alias: 'Gantel bilan bitseps', isPrimary: true }, { language: 'UZ', alias: 'Bitsepsga curl' },
    ],
  },
  {
    slug: 'hammer-curl', category: 'ISOLATION', equipment: 'dumbbell', primaryMuscle: 'BICEPS',
    secondaryMuscles: [{ muscle: 'FOREARMS', weight: 0.4 }],
    aliases: [
      { language: 'EN', alias: 'Hammer Curl', isPrimary: true },
      { language: 'RU', alias: 'Молотки', isPrimary: true },
      { language: 'UZ', alias: 'Hammer curl', isPrimary: true },
    ],
  },
  {
    slug: 'preacher-curl', category: 'ISOLATION', equipment: 'barbell', primaryMuscle: 'BICEPS',
    aliases: [
      { language: 'EN', alias: 'Preacher Curl', isPrimary: true },
      { language: 'RU', alias: 'Подъём на скамье Скотта', isPrimary: true },
      { language: 'UZ', alias: 'Preacher curl', isPrimary: true },
    ],
  },
  {
    slug: 'triceps-pushdown', category: 'ISOLATION', equipment: 'cable', primaryMuscle: 'TRICEPS',
    aliases: [
      { language: 'EN', alias: 'Triceps Pushdown', isPrimary: true }, { language: 'EN', alias: 'Tricep Pushdown' }, { language: 'EN', alias: 'Cable Pushdown' },
      { language: 'RU', alias: 'Разгибание рук на блоке', isPrimary: true },
      { language: 'UZ', alias: 'Triceps pushdown', isPrimary: true },
    ],
  },
  {
    slug: 'skull-crusher', category: 'ISOLATION', equipment: 'barbell', primaryMuscle: 'TRICEPS',
    aliases: [
      { language: 'EN', alias: 'Skull Crusher', isPrimary: true }, { language: 'EN', alias: 'Lying Triceps Extension' },
      { language: 'RU', alias: 'Французский жим лёжа', isPrimary: true },
      { language: 'UZ', alias: 'Skull crusher', isPrimary: true },
    ],
  },
  {
    slug: 'overhead-triceps-extension', category: 'ISOLATION', equipment: 'dumbbell', primaryMuscle: 'TRICEPS',
    aliases: [
      { language: 'EN', alias: 'Overhead Triceps Extension', isPrimary: true },
      { language: 'RU', alias: 'Французский жим стоя', isPrimary: true },
      { language: 'UZ', alias: 'Overhead triceps extension', isPrimary: true },
    ],
  },
  {
    slug: 'close-grip-bench-press', category: 'COMPOUND', equipment: 'barbell', primaryMuscle: 'TRICEPS',
    secondaryMuscles: [{ muscle: 'CHEST', weight: 0.3 }],
    aliases: [
      { language: 'EN', alias: 'Close-Grip Bench Press', isPrimary: true },
      { language: 'RU', alias: 'Жим узким хватом', isPrimary: true },
      { language: 'UZ', alias: 'Close grip bench press', isPrimary: true },
    ],
  },
  {
    slug: 'wrist-curl', category: 'ISOLATION', equipment: 'dumbbell', primaryMuscle: 'FOREARMS',
    aliases: [
      { language: 'EN', alias: 'Wrist Curl', isPrimary: true },
      { language: 'RU', alias: 'Сгибание запястий', isPrimary: true },
      { language: 'UZ', alias: 'Bilak curl', isPrimary: true },
    ],
  },
  {
    slug: 'farmers-carry', category: 'COMPOUND', equipment: 'dumbbell', primaryMuscle: 'FOREARMS',
    secondaryMuscles: [{ muscle: 'TRAPS', weight: 0.3 }, { muscle: 'ABS', weight: 0.2 }],
    aliases: [
      { language: 'EN', alias: "Farmer's Carry", isPrimary: true }, { language: 'EN', alias: 'Farmers Walk' },
      { language: 'RU', alias: 'Фермерская прогулка', isPrimary: true },
      { language: 'UZ', alias: "Farmer's carry", isPrimary: true },
    ],
  },
  {
    slug: 'crunch', category: 'ISOLATION', equipment: 'bodyweight', primaryMuscle: 'ABS',
    aliases: [
      { language: 'EN', alias: 'Crunch', isPrimary: true },
      { language: 'RU', alias: 'Скручивания', isPrimary: true },
      { language: 'UZ', alias: 'Press burish', isPrimary: true }, { language: 'UZ', alias: 'Crunch' },
    ],
  },
  {
    slug: 'plank', category: 'ISOLATION', equipment: 'bodyweight', primaryMuscle: 'ABS',
    secondaryMuscles: [{ muscle: 'OBLIQUES', weight: 0.3 }],
    aliases: [
      { language: 'EN', alias: 'Plank', isPrimary: true },
      { language: 'RU', alias: 'Планка', isPrimary: true },
      { language: 'UZ', alias: 'Plank', isPrimary: true },
    ],
  },
  {
    slug: 'hanging-leg-raise', category: 'ISOLATION', equipment: 'bodyweight', primaryMuscle: 'ABS',
    aliases: [
      { language: 'EN', alias: 'Hanging Leg Raise', isPrimary: true },
      { language: 'RU', alias: 'Подъём ног в висе', isPrimary: true },
      { language: 'UZ', alias: "Osilib oyoq ko'tarish", isPrimary: true },
    ],
  },
  {
    slug: 'russian-twist', category: 'ISOLATION', equipment: 'bodyweight', primaryMuscle: 'OBLIQUES',
    aliases: [
      { language: 'EN', alias: 'Russian Twist', isPrimary: true },
      { language: 'RU', alias: 'Русский твист', isPrimary: true },
      { language: 'UZ', alias: 'Russian twist', isPrimary: true },
    ],
  },
  {
    slug: 'cable-woodchopper', category: 'ISOLATION', equipment: 'cable', primaryMuscle: 'OBLIQUES',
    aliases: [
      { language: 'EN', alias: 'Cable Woodchopper', isPrimary: true }, { language: 'EN', alias: 'Woodchopper' },
      { language: 'RU', alias: 'Дровосек на блоке', isPrimary: true },
      { language: 'UZ', alias: 'Woodchopper', isPrimary: true },
    ],
  },
  {
    slug: 'squat', category: 'COMPOUND', equipment: 'barbell', primaryMuscle: 'QUADS',
    secondaryMuscles: [{ muscle: 'GLUTES', weight: 0.4 }, { muscle: 'HAMSTRINGS', weight: 0.3 }],
    aliases: [
      { language: 'EN', alias: 'Squat', isPrimary: true }, { language: 'EN', alias: 'Back Squat' },
      { language: 'RU', alias: 'Приседания', isPrimary: true },
      { language: 'UZ', alias: 'Squat', isPrimary: true }, { language: 'UZ', alias: 'Choʼkalash' },
    ],
  },
  {
    slug: 'leg-press', category: 'COMPOUND', equipment: 'machine', primaryMuscle: 'QUADS',
    secondaryMuscles: [{ muscle: 'GLUTES', weight: 0.3 }, { muscle: 'HAMSTRINGS', weight: 0.2 }],
    aliases: [
      { language: 'EN', alias: 'Leg Press', isPrimary: true },
      { language: 'RU', alias: 'Жим ногами', isPrimary: true },
      { language: 'UZ', alias: 'Leg press', isPrimary: true },
    ],
  },
  {
    slug: 'lunge', category: 'COMPOUND', equipment: 'dumbbell', primaryMuscle: 'QUADS',
    secondaryMuscles: [{ muscle: 'GLUTES', weight: 0.4 }, { muscle: 'HAMSTRINGS', weight: 0.2 }],
    aliases: [
      { language: 'EN', alias: 'Lunge', isPrimary: true },
      { language: 'RU', alias: 'Выпады', isPrimary: true },
      { language: 'UZ', alias: 'Lunge', isPrimary: true }, { language: 'UZ', alias: 'Qadam tashlab choʼkalash' },
    ],
  },
  {
    slug: 'leg-extension', category: 'ISOLATION', equipment: 'machine', primaryMuscle: 'QUADS',
    aliases: [
      { language: 'EN', alias: 'Leg Extension', isPrimary: true },
      { language: 'RU', alias: 'Разгибание ног', isPrimary: true },
      { language: 'UZ', alias: 'Leg extension', isPrimary: true },
    ],
  },
  {
    slug: 'romanian-deadlift', category: 'COMPOUND', equipment: 'barbell', primaryMuscle: 'HAMSTRINGS',
    secondaryMuscles: [{ muscle: 'GLUTES', weight: 0.4 }, { muscle: 'BACK', weight: 0.2 }],
    aliases: [
      { language: 'EN', alias: 'Romanian Deadlift', isPrimary: true }, { language: 'EN', alias: 'RDL' },
      { language: 'RU', alias: 'Румынская тяга', isPrimary: true },
      { language: 'UZ', alias: 'Romanian deadlift', isPrimary: true },
    ],
  },
  {
    slug: 'leg-curl', category: 'ISOLATION', equipment: 'machine', primaryMuscle: 'HAMSTRINGS',
    aliases: [
      { language: 'EN', alias: 'Leg Curl', isPrimary: true },
      { language: 'RU', alias: 'Сгибание ног', isPrimary: true },
      { language: 'UZ', alias: 'Leg curl', isPrimary: true },
    ],
  },
  {
    slug: 'hip-thrust', category: 'ISOLATION', equipment: 'barbell', primaryMuscle: 'GLUTES',
    secondaryMuscles: [{ muscle: 'HAMSTRINGS', weight: 0.3 }],
    aliases: [
      { language: 'EN', alias: 'Hip Thrust', isPrimary: true },
      { language: 'RU', alias: 'Ягодичный мост со штангой', isPrimary: true },
      { language: 'UZ', alias: 'Hip thrust', isPrimary: true },
    ],
  },
  {
    slug: 'glute-bridge', category: 'ISOLATION', equipment: 'bodyweight', primaryMuscle: 'GLUTES',
    aliases: [
      { language: 'EN', alias: 'Glute Bridge', isPrimary: true },
      { language: 'RU', alias: 'Ягодичный мостик', isPrimary: true },
      { language: 'UZ', alias: 'Glute bridge', isPrimary: true },
    ],
  },
  {
    slug: 'calf-raise', category: 'ISOLATION', equipment: 'machine', primaryMuscle: 'CALVES',
    aliases: [
      { language: 'EN', alias: 'Calf Raise', isPrimary: true }, { language: 'EN', alias: 'Standing Calf Raise' },
      { language: 'RU', alias: 'Подъём на носки стоя', isPrimary: true },
      { language: 'UZ', alias: 'Calf raise', isPrimary: true }, { language: 'UZ', alias: 'Boldirga tik turib' },
    ],
  },
  {
    slug: 'seated-calf-raise', category: 'ISOLATION', equipment: 'machine', primaryMuscle: 'CALVES',
    aliases: [
      { language: 'EN', alias: 'Seated Calf Raise', isPrimary: true },
      { language: 'RU', alias: 'Подъём на носки сидя', isPrimary: true },
      { language: 'UZ', alias: "O'tirib boldir ko'tarish", isPrimary: true },
    ],
  },
];

async function main() {
  console.log(`Seeding ${MUSCLE_GROUPS.length} muscle groups...`);
  for (const mg of MUSCLE_GROUPS) {
    await prisma.muscleGroup.upsert({
      where: { code: mg.code },
      update: { region: mg.region, sortOrder: mg.sortOrder },
      create: mg,
    });
  }

  console.log(`Seeding ${EXERCISES.length} exercises...`);
  for (const ex of EXERCISES) {
    const exercise = await prisma.exercise.upsert({
      where: { slug: ex.slug },
      update: { category: ex.category, equipment: ex.equipment, primaryMuscle: ex.primaryMuscle },
      create: { slug: ex.slug, category: ex.category, equipment: ex.equipment, primaryMuscle: ex.primaryMuscle },
    });

    const muscleLinks: { muscle: MuscleCode; role: MuscleRole; weight: number }[] = [
      { muscle: ex.primaryMuscle, role: 'PRIMARY', weight: 1.0 },
      ...(ex.secondaryMuscles ?? []).map((s) => ({ muscle: s.muscle, role: 'SECONDARY' as MuscleRole, weight: s.weight })),
    ];
    for (const link of muscleLinks) {
      await prisma.exerciseMuscle.upsert({
        where: { exerciseId_muscle: { exerciseId: exercise.id, muscle: link.muscle } },
        update: { role: link.role, weight: link.weight },
        create: { exerciseId: exercise.id, muscle: link.muscle, role: link.role, weight: link.weight },
      });
    }

    for (const a of ex.aliases) {
      const normalized = normalizeExerciseText(a.alias);
      await prisma.exerciseAlias.upsert({
        where: { language_normalized: { language: a.language, normalized } },
        update: { exerciseId: exercise.id, alias: a.alias, isPrimary: a.isPrimary ?? false },
        create: { exerciseId: exercise.id, language: a.language, alias: a.alias, normalized, isPrimary: a.isPrimary ?? false },
      });
    }
  }

  console.log('Exercise catalog seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
