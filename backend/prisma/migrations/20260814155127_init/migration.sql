-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE');

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('LOSE', 'MAINTAIN', 'GAIN');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'SNACK', 'DINNER');

-- CreateEnum
CREATE TYPE "MealSource" AS ENUM ('MANUAL', 'AI');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('UZ', 'RU', 'EN');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT,
    "googleId" TEXT,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "age" INTEGER,
    "heightCm" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "goalWeightKg" DOUBLE PRECISION,
    "gender" "Gender",
    "activityLevel" "ActivityLevel",
    "goal" "Goal",
    "dailyCalorieTarget" INTEGER,
    "proteinTargetG" INTEGER,
    "carbsTargetG" INTEGER,
    "fatTargetG" INTEGER,
    "onboardingCompletedAt" TIMESTAMP(3),
    "language" "Language" NOT NULL DEFAULT 'UZ',
    "theme" "Theme" NOT NULL DEFAULT 'DARK',
    "notifyDaily" BOOLEAN NOT NULL DEFAULT true,
    "notifyWeekly" BOOLEAN NOT NULL DEFAULT true,
    "notifyAiTips" BOOLEAN NOT NULL DEFAULT false,
    "refreshTokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mealType" "MealType" NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT,
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "servingSize" TEXT,
    "source" "MealSource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_items" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "meal_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New chat',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegramId_key" ON "users"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "meals_userId_date_idx" ON "meals"("userId", "date");

-- CreateIndex
CREATE INDEX "conversations_userId_updatedAt_idx" ON "conversations"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "chat_messages_conversationId_createdAt_idx" ON "chat_messages"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
