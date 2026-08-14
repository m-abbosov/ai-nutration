import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { buildAiContext } from '../ai/context.util';
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
  ) {}

  async generate(
    userId: string,
    dto: CreateRecommendationDto,
  ): Promise<RecommendationsResponseDto> {
    const [user, daily] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.nutritionService.getDaily(userId),
    ]);

    const context = buildAiContext(user, daily);
    const result = await this.aiService.generateRecommendations(
      context,
      dto.mealType,
    );

    return { recommendations: result.recommendations };
  }
}
