import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CalculatorsService } from './calculators.service';
import { RecordCalculatorUsageDto } from './dto/record-calculator-usage.dto';

/** Public — calculator pages (/calculators/:slug) work for anonymous
 * visitors, so this endpoint must too. OptionalJwtAuthGuard attributes the
 * usage to a user when a valid token is present, without requiring one. */
@UseGuards(OptionalJwtAuthGuard)
@Controller('calculators')
export class CalculatorsController {
  constructor(private readonly calculatorsService: CalculatorsService) {}

  @Post('usage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recordUsage(
    @Req() req: Request,
    @Body() dto: RecordCalculatorUsageDto,
  ): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    await this.calculatorsService.record(user?.id ?? null, dto);
  }
}
