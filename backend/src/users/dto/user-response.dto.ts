import { ActivityLevel, Gender, Goal, Language, Theme } from '@prisma/client';

/** Response shape mirrored from docs/API_CONTRACT.md `UserDto`. */
export interface UserResponseDto {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  goalWeightKg: number | null;
  gender: Gender | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
  dailyCalorieTarget: number | null;
  proteinTargetG: number | null;
  carbsTargetG: number | null;
  fatTargetG: number | null;
  language: Language;
  theme: Theme;
  notifyDaily: boolean;
  notifyWeekly: boolean;
  notifyAiTips: boolean;
  onboardingCompletedAt: string | null;
}
