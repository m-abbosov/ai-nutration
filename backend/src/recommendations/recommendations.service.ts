import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { buildAiContext } from '../ai/context.util';
import { UserAiCredentialsService } from '../ai/user-ai-credentials.service';
import { PrismaService } from '../database/prisma.service';
import { NutritionService } from '../nutrition/nutrition.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { RecommendationsResponseDto } from './dto/recommendation-response.dto';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nutritionService: NutritionService,
    private readonly aiService: AiService,
    private readonly userAiCredentials: UserAiCredentialsService,
  ) {}

  async generate(
    userId: string,
    dto: CreateRecommendationDto,
  ): Promise<RecommendationsResponseDto> {
    const [user, daily] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.nutritionService.getDaily(userId),
    ]);

    const credentials = this.userAiCredentials.resolve(user);
    if (!credentials) {
      throw new BadRequestException(
        'No AI API key configured — add one in Settings to get recommendations',
      );
    }

    const context = buildAiContext(user, daily);
    const result = await this.aiService.generateRecommendations(
      context,
      credentials.provider,
      credentials.apiKey,
      dto.mealType,
    );

    if (!result.ok) {
      if (result.reason === 'INVALID_KEY') {
        await this.userAiCredentials.recordStatus(
          userId,
          'INVALID',
          result.reason,
        );
        throw new UnauthorizedException(
          'Your AI API key is invalid — update it in Settings',
        );
      }
      if (result.reason === 'EXHAUSTED') {
        await this.userAiCredentials.recordStatus(
          userId,
          'EXHAUSTED',
          result.reason,
        );
        throw new HttpException(
          'Your AI API key has run out of quota — update it in Settings',
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
      throw new BadGatewayException(
        'AI recommendation generation failed, please try again',
      );
    }

    if (user.aiKeyStatus && user.aiKeyStatus !== 'OK') {
      await this.userAiCredentials.recordStatus(userId, 'OK', null);
    }

    return { recommendations: result.data.recommendations };
  }
}
