import { User } from '@prisma/client';
import { UserResponseDto } from './dto/user-response.dto';

/** Maps a Prisma `User` row to the public `UserDto` contract shape, never
 * exposing internal fields like refreshTokenHash/googleId/telegramId. */
export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    aiProvider: user.aiProvider,
    aiKeyLast4: user.aiApiKeyLast4,
    aiKeyStatus: user.aiKeyStatus,
    aiKeyStatusMessage: user.aiKeyStatusMessage,
    age: user.age,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    goalWeightKg: user.goalWeightKg,
    gender: user.gender,
    activityLevel: user.activityLevel,
    goal: user.goal,
    dailyCalorieTarget: user.dailyCalorieTarget,
    proteinTargetG: user.proteinTargetG,
    carbsTargetG: user.carbsTargetG,
    fatTargetG: user.fatTargetG,
    language: user.language,
    theme: user.theme,
    notifyDaily: user.notifyDaily,
    notifyWeekly: user.notifyWeekly,
    notifyAiTips: user.notifyAiTips,
    onboardingCompletedAt: user.onboardingCompletedAt
      ? user.onboardingCompletedAt.toISOString()
      : null,
  };
}
