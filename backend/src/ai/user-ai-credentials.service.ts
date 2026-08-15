import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiKeyStatus, User } from '@prisma/client';
import { EnvConfig } from '../config/env.validation';
import { PrismaService } from '../database/prisma.service';
import { decryptSecret } from './crypto.util';

@Injectable()
export class UserAiCredentialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  /** Decrypts the requesting user's own stored provider key, or null if
   * they haven't configured one yet — AI features stay off until they do. */
  resolve(
    user: User,
  ): { provider: NonNullable<User['aiProvider']>; apiKey: string } | null {
    if (!user.aiProvider || !user.aiApiKeyEncrypted) return null;
    const secret = this.configService.get('AI_KEY_ENCRYPTION_SECRET', {
      infer: true,
    });
    return {
      provider: user.aiProvider,
      apiKey: decryptSecret(user.aiApiKeyEncrypted, secret),
    };
  }

  async recordStatus(
    userId: string,
    status: AiKeyStatus,
    message: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { aiKeyStatus: status, aiKeyStatusMessage: message },
    });
  }
}
