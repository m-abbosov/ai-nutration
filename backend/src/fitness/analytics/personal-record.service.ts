import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DetectedPrDto } from './dto/detected-pr.dto';
import { PersonalRecordResponseDto } from './dto/personal-record-response.dto';
import { detectPersonalRecords, PRSetInput } from './lib/personal-record.util';

@Injectable()
export class PersonalRecordService {
  constructor(private readonly prisma: PrismaService) {}

  /** Called by workout.service.ts right after a workout is saved. For each
   * exercise in that workout, compares its sets against the user's current
   * best per PRType and upserts whichever were beaten. Returns only the
   * newly-set records (usually empty) for the Phase D celebration UI. */
  async detectAndRecordForWorkout(
    userId: string,
    exercises: { exerciseId: string; sets: PRSetInput[] }[],
    achievedAt: Date,
  ): Promise<DetectedPrDto[]> {
    const results: DetectedPrDto[] = [];

    for (const ex of exercises) {
      const existingRows = await this.prisma.personalRecord.findMany({
        where: { userId, exerciseId: ex.exerciseId },
        select: { recordType: true, value: true },
      });
      const detected = detectPersonalRecords(ex.sets, existingRows);

      for (const pr of detected) {
        await this.prisma.personalRecord.upsert({
          where: { userId_exerciseId_recordType: { userId, exerciseId: ex.exerciseId, recordType: pr.recordType } },
          update: { value: pr.value, weight: pr.weight, reps: pr.reps, achievedAt },
          create: {
            userId,
            exerciseId: ex.exerciseId,
            recordType: pr.recordType,
            value: pr.value,
            weight: pr.weight,
            reps: pr.reps,
            achievedAt,
          },
        });
        results.push({ exerciseId: ex.exerciseId, ...pr });
      }
    }

    return results;
  }

  async list(userId: string): Promise<PersonalRecordResponseDto[]> {
    const records = await this.prisma.personalRecord.findMany({
      where: { userId },
      include: { exercise: true },
      orderBy: { achievedAt: 'desc' },
    });
    return records.map((r) => ({
      id: r.id,
      exerciseId: r.exerciseId,
      exerciseSlug: r.exercise.slug,
      recordType: r.recordType,
      value: r.value,
      weight: r.weight,
      reps: r.reps,
      achievedAt: r.achievedAt.toISOString(),
    }));
  }
}
