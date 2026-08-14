import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CreateMealDto } from './dto/create-meal.dto';
import { FindMealsQueryDto } from './dto/find-meals-query.dto';
import { MealResponseDto } from './dto/meal-response.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { MealsService } from './meals.service';

@UseGuards(JwtAuthGuard)
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get()
  findByDate(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: FindMealsQueryDto,
  ): Promise<MealResponseDto[]> {
    return this.mealsService.findByDate(user.id, query.date);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMealDto,
  ): Promise<MealResponseDto> {
    return this.mealsService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateMealDto,
  ): Promise<MealResponseDto> {
    return this.mealsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.mealsService.remove(user.id, id);
  }
}
