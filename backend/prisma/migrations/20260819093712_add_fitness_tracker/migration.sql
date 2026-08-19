-- CreateEnum
CREATE TYPE "MuscleCode" AS ENUM ('CHEST', 'UPPER_CHEST', 'BACK', 'LATS', 'TRAPS', 'SHOULDERS', 'FRONT_DELTS', 'SIDE_DELTS', 'REAR_DELTS', 'BICEPS', 'TRICEPS', 'FOREARMS', 'ABS', 'OBLIQUES', 'GLUTES', 'QUADS', 'HAMSTRINGS', 'CALVES');

-- CreateEnum
CREATE TYPE "MuscleRegion" AS ENUM ('FRONT', 'BACK', 'BOTH');

-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('COMPOUND', 'ISOLATION', 'CARDIO', 'BODYWEIGHT');

-- CreateEnum
CREATE TYPE "MuscleRole" AS ENUM ('PRIMARY', 'SECONDARY');

-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('KG', 'LB');

-- CreateEnum
CREATE TYPE "WorkoutSource" AS ENUM ('MANUAL', 'AI');

-- CreateEnum
CREATE TYPE "PRType" AS ENUM ('MAX_WEIGHT', 'MAX_REPS', 'MAX_VOLUME', 'EST_1RM');

-- CreateTable
CREATE TABLE "muscle_groups" (
    "code" "MuscleCode" NOT NULL,
    "region" "MuscleRegion" NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "muscle_groups_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "ExerciseCategory" NOT NULL,
    "primaryMuscle" "MuscleCode" NOT NULL,
    "equipment" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_aliases" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "alias" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,

    CONSTRAINT "exercise_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_muscles" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "muscle" "MuscleCode" NOT NULL,
    "role" "MuscleRole" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "exercise_muscles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationSec" INTEGER,
    "notes" TEXT,
    "totalVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedCalories" INTEGER,
    "source" "WorkoutSource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_exercises" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "workout_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_sets" (
    "id" TEXT NOT NULL,
    "workoutExerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "weightUnit" "WeightUnit" NOT NULL DEFAULT 'KG',
    "reps" INTEGER,
    "durationSec" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "exercise_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "recordType" "PRType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION,
    "reps" INTEGER,
    "achievedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "muscle_progress_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "muscle" "MuscleCode" NOT NULL,
    "snapshotDate" DATE NOT NULL,
    "progressScore" INTEGER NOT NULL,
    "weeklySets" INTEGER NOT NULL,
    "weeklyVolume" DOUBLE PRECISION NOT NULL,
    "sessionsCount" INTEGER NOT NULL,
    "lastTrainedAt" TIMESTAMP(3),
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "muscle_progress_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exercises_slug_key" ON "exercises"("slug");

-- CreateIndex
CREATE INDEX "exercises_primaryMuscle_idx" ON "exercises"("primaryMuscle");

-- CreateIndex
CREATE INDEX "exercise_aliases_exerciseId_idx" ON "exercise_aliases"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_aliases_language_normalized_key" ON "exercise_aliases"("language", "normalized");

-- CreateIndex
CREATE INDEX "exercise_muscles_muscle_idx" ON "exercise_muscles"("muscle");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_muscles_exerciseId_muscle_key" ON "exercise_muscles"("exerciseId", "muscle");

-- CreateIndex
CREATE INDEX "workouts_userId_date_idx" ON "workouts"("userId", "date");

-- CreateIndex
CREATE INDEX "workout_exercises_workoutId_idx" ON "workout_exercises"("workoutId");

-- CreateIndex
CREATE INDEX "workout_exercises_exerciseId_idx" ON "workout_exercises"("exerciseId");

-- CreateIndex
CREATE INDEX "exercise_sets_workoutExerciseId_idx" ON "exercise_sets"("workoutExerciseId");

-- CreateIndex
CREATE INDEX "personal_records_userId_exerciseId_idx" ON "personal_records"("userId", "exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "personal_records_userId_exerciseId_recordType_key" ON "personal_records"("userId", "exerciseId", "recordType");

-- CreateIndex
CREATE INDEX "muscle_progress_snapshots_userId_snapshotDate_idx" ON "muscle_progress_snapshots"("userId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "muscle_progress_snapshots_userId_muscle_snapshotDate_key" ON "muscle_progress_snapshots"("userId", "muscle", "snapshotDate");

-- AddForeignKey
ALTER TABLE "exercise_aliases" ADD CONSTRAINT "exercise_aliases_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_muscles" ADD CONSTRAINT "exercise_muscles_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_muscles" ADD CONSTRAINT "exercise_muscles_muscle_fkey" FOREIGN KEY ("muscle") REFERENCES "muscle_groups"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_sets" ADD CONSTRAINT "exercise_sets_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "workout_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muscle_progress_snapshots" ADD CONSTRAINT "muscle_progress_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muscle_progress_snapshots" ADD CONSTRAINT "muscle_progress_snapshots_muscle_fkey" FOREIGN KEY ("muscle") REFERENCES "muscle_groups"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
