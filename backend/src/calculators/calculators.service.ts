import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { RecordCalculatorUsageDto } from './dto/record-calculator-usage.dto';

// Rough cap on the JSON blob size stored per row — a calculator form has a
// handful of numeric fields, so a well-formed payload never gets close to
// this; it only guards against a malformed/abusive request bloating the table.
const MAX_JSON_CHARS = 4000;

function clampJson(value: Record<string, unknown>): Prisma.InputJsonValue {
  return JSON.stringify(value).length > MAX_JSON_CHARS
    ? { truncated: true }
    : (value as Prisma.InputJsonValue);
}

@Injectable()
export class CalculatorsService {
  private readonly logger = new Logger(CalculatorsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Never throws — a logging failure must never break the calculator UI
   * for the visitor using it. */
  async record(
    userId: string | null,
    dto: RecordCalculatorUsageDto,
  ): Promise<void> {
    try {
      await this.prisma.calculatorUsageLog.create({
        data: {
          userId,
          calculatorId: dto.calculatorId,
          inputs: clampJson(dto.inputs),
          result: clampJson(dto.result),
        },
      });
    } catch (err) {
      this.logger.warn(
        `Failed to record calculator usage: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
