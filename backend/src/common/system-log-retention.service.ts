import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

const RETENTION_DAYS = 30;

/** SystemLog has no other cap on growth — every 4xx/5xx across the whole
 * API writes a row (see common/filters/http-exception.filter.ts) — so this
 * prunes anything older than the admin panel's log viewer would reasonably
 * need. */
@Injectable()
export class SystemLogRetentionService {
  private readonly logger = new Logger(SystemLogRetentionService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeOldLogs(): Promise<void> {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const { count } = await this.prisma.systemLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (count > 0) {
      this.logger.log(
        `Purged ${count} system log row(s) older than ${RETENTION_DAYS} days`,
      );
    }
  }
}
