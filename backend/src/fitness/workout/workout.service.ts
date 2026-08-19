import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { addDays, parseDateOnly, todayDateOnly } from '../../common/date.util';
import { PrismaService } from '../../database/prisma.service';
import { PersonalRecordService } from '../analytics/personal-record.service';
import { ExerciseService } from '../exercise/exercise.service';
import { ProgressService } from '../progress/progress.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { WorkoutResponseDto } from './dto/workout-response.dto';
import { estimateWorkoutCalories } from './lib/calories.util';
import { calculateTotalVolume } from './lib/volume.util';
import { toWorkoutResponseDto } from './workout.mapper';

const WORKOUT_INCLUDE = { exercises: { include: { exercise: true, sets: true } } } as const;

function safeParseDate(value: string): Date {
  try {
    return parseDateOnly(value);
  } catch {
    throw new BadRequestException(`Invalid date "${value}", expected YYYY-MM-DD`);
  }
}

@Injectable()
export class WorkoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exerciseService: ExerciseService,
    private readonly progressService: ProgressService,
    private readonly personalRecordService: PersonalRecordService,
  ) {}

  async create(userId: string, dto: CreateWorkoutDto): Promise<WorkoutResponseDto> {
    const exerciseIds = [...new Set(dto.exercises.map((e) => e.exerciseId))];
    const found = await this.exerciseService.findManyByIds(exerciseIds);
    if (found.length !== exerciseIds.length) {
      const foundIds = new Set(found.map((e) => e.id));
      const missing = exerciseIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(`Unknown exerciseId(s): ${missing.join(', ')}`);
    }

    const volumeInput = dto.exercises.map((ex) => ({
      sets: ex.sets.map((s) => ({
        weight: s.weight ?? null,
        weightUnit: s.weightUnit ?? 'KG',
        reps: s.reps ?? null,
        completed: s.completed ?? true,
      })),
    }));
    const totalVolume = calculateTotalVolume(volumeInput);
    const estimatedCalories = estimateWorkoutCalories({
      durationSec: dto.durationSec ?? null,
      totalVolumeKg: totalVolume,
    });

    const workout = await this.prisma.workout.create({
      data: {
        userId,
        date: dto.date ? safeParseDate(dto.date) : todayDateOnly(),
        durationSec: dto.durationSec ?? null,
        notes: dto.notes ?? null,
        source: dto.source ?? 'MANUAL',
        totalVolume,
        estimatedCalories,
        exercises: {
          create: dto.exercises.map((ex, index) => ({
            exerciseId: ex.exerciseId,
            order: index,
            sets: {
              create: ex.sets.map((s) => ({
                setNumber: s.setNumber,
                weight: s.weight ?? null,
                weightUnit: s.weightUnit ?? 'KG',
                reps: s.reps ?? null,
                durationSec: s.durationSec ?? null,
                completed: s.completed ?? true,
              })),
            },
          })),
        },
      },
      include: WORKOUT_INCLUDE,
    });

    const touchedMuscles = await this.prisma.exerciseMuscle.findMany({
      where: { exerciseId: { in: exerciseIds } },
      select: { muscle: true },
    });
    await this.progressService.invalidateSnapshotsForMuscles(
      userId,
      touchedMuscles.map((m) => m.muscle),
    );

    const newPersonalRecords = await this.personalRecordService.detectAndRecordForWorkout(
      userId,
      dto.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets.map((s) => ({
          weight: s.weight ?? null,
          weightUnit: s.weightUnit ?? 'KG',
          reps: s.reps ?? null,
          completed: s.completed ?? true,
        })),
      })),
      workout.createdAt,
    );

    return toWorkoutResponseDto(workout, newPersonalRecords);
  }

  async findAll(userId: string, days = 30): Promise<WorkoutResponseDto[]> {
    const since = addDays(todayDateOnly(), -(days - 1));
    const workouts = await this.prisma.workout.findMany({
      where: { userId, date: { gte: since } },
      include: WORKOUT_INCLUDE,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 200,
    });
    return workouts.map((w) => toWorkoutResponseDto(w));
  }

  async findOne(userId: string, id: string): Promise<WorkoutResponseDto> {
    const workout = await this.prisma.workout.findUnique({ where: { id }, include: WORKOUT_INCLUDE });
    if (!workout) throw new NotFoundException('Workout not found');
    if (workout.userId !== userId) throw new ForbiddenException('You do not have access to this workout');
    return toWorkoutResponseDto(workout);
  }
}
