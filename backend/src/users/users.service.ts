import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Gender, User } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { encryptSecret, last4 } from '../ai/crypto.util';
import { EnvConfig } from '../config/env.validation';
import { PrismaService } from '../database/prisma.service';
import { calculateCalorieTargets } from './calorie.util';
import { OnboardingDto } from './dto/onboarding.dto';
import { SetAiKeyDto } from './dto/set-ai-key.dto';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

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

  /** Live-tests the key against its provider before storing it, so a typo'd
   * or already-exhausted key is never silently saved. */
  async setAiKey(userId: string, dto: SetAiKeyDto): Promise<UserResponseDto> {
    await this.findByIdOrThrow(userId);

    const check = await this.aiService.testKey(dto.provider, dto.apiKey);
    if (!check.ok) {
      const reason =
        check.reason === 'INVALID_KEY'
          ? 'This API key was rejected by the provider — double check it and try again'
          : check.reason === 'EXHAUSTED'
            ? 'This API key has no quota left — use a key with available balance'
            : 'Could not verify this API key right now — please try again';
      throw new BadRequestException(reason);
    }

    const secret = this.configService.get('AI_KEY_ENCRYPTION_SECRET', {
      infer: true,
    });
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        aiProvider: dto.provider,
        aiApiKeyEncrypted: encryptSecret(dto.apiKey, secret),
        aiApiKeyLast4: last4(dto.apiKey),
        aiKeyStatus: 'OK',
        aiKeyStatusMessage: null,
      },
    });

    return toUserResponseDto(updated);
  }

  async removeAiKey(userId: string): Promise<UserResponseDto> {
    await this.findByIdOrThrow(userId);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        aiProvider: null,
        aiApiKeyEncrypted: null,
        aiApiKeyLast4: null,
        aiKeyStatus: null,
        aiKeyStatusMessage: null,
      },
    });
    return toUserResponseDto(updated);
  }
}
