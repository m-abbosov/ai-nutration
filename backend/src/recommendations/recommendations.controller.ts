import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { RecommendationsResponseDto } from './dto/recommendation-response.dto';
import { RecommendationsService } from './recommendations.service';

@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  // Sane cap to avoid runaway Gemini spend.
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  generate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRecommendationDto,
  ): Promise<RecommendationsResponseDto> {
    return this.recommendationsService.generate(user.id, dto);
  }
}
