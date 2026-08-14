import { Injectable, NotFoundException } from '@nestjs/common';
import { Gender, User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { calculateCalorieTargets } from './calorie.util';
import { OnboardingDto } from './dto/onboarding.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { toUserResponseDto } from './users.mapper';

const ONBOARDING_METRIC_KEYS = [
  'age',
  'heightCm',
  'weightKg',
  'gender',
  'activityLevel',
  'goal',
] as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdOrThrow(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.findByIdOrThrow(userId);
    return toUserResponseDto(user);
  }

  async completeOnboarding(
    userId: string,
    dto: OnboardingDto,
  ): Promise<UserResponseDto> {
    const existing = await this.findByIdOrThrow(userId);
    const gender: Gender = dto.gender ?? existing.gender ?? 'OTHER';

    const targets = calculateCalorieTargets({
      age: dto.age,
      heightCm: dto.heightCm,
      weightKg: dto.weightKg,
      gender,
      activityLevel: dto.activityLevel,
      goal: dto.goal,
    });

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        age: dto.age,
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
        gender,
        activityLevel: dto.activityLevel,
        goal: dto.goal,
        goalWeightKg: dto.goalWeightKg ?? existing.goalWeightKg,
        dailyCalorieTarget: targets.dailyCalorieTarget,
        proteinTargetG: targets.proteinTargetG,
        carbsTargetG: targets.carbsTargetG,
        fatTargetG: targets.fatTargetG,
        onboardingCompletedAt: new Date(),
      },
    });

    return toUserResponseDto(updated);
  }

  async updateMe(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const existing = await this.findByIdOrThrow(userId);

    const touchesOnboardingMetrics = ONBOARDING_METRIC_KEYS.some(
      (key) => dto[key] !== undefined,
    );

    const merged = {
      age: dto.age ?? existing.age,
      heightCm: dto.heightCm ?? existing.heightCm,
      weightKg: dto.weightKg ?? existing.weightKg,
      gender: dto.gender ?? existing.gender,
      activityLevel: dto.activityLevel ?? existing.activityLevel,
      goal: dto.goal ?? existing.goal,
    };

    let targetFields: {
      dailyCalorieTarget?: number;
      proteinTargetG?: number;
      carbsTargetG?: number;
      fatTargetG?: number;
    } = {};

    if (
      touchesOnboardingMetrics &&
      merged.age !== null &&
      merged.heightCm !== null &&
      merged.weightKg !== null &&
      merged.gender !== null &&
      merged.activityLevel !== null &&
      merged.goal !== null
    ) {
      targetFields = calculateCalorieTargets({
        age: merged.age,
        heightCm: merged.heightCm,
        weightKg: merged.weightKg,
        gender: merged.gender,
        activityLevel: merged.activityLevel,
        goal: merged.goal,
      });
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        age: dto.age,
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
        goalWeightKg: dto.goalWeightKg,
        gender: dto.gender,
        activityLevel: dto.activityLevel,
        goal: dto.goal,
        language: dto.language,
        theme: dto.theme,
        notifyDaily: dto.notifyDaily,
        notifyWeekly: dto.notifyWeekly,
        notifyAiTips: dto.notifyAiTips,
        ...targetFields,
      },
    });

    return toUserResponseDto(updated);
  }
}
