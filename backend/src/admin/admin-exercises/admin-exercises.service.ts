import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditLogService } from '../../audit/audit-log.service';
import { PrismaService } from '../../database/prisma.service';
import { normalizeExerciseText } from '../../fitness/lib/normalize-text.util';
import { PaginatedDto, paginationParams } from '../common/pagination.dto';
import {
  AdminExerciseDetailDto,
  AdminExerciseListItemDto,
  CreateExerciseDto,
  ListAdminExercisesQueryDto,
  UpdateExerciseDto,
} from './dto/admin-exercise.dto';

type ExerciseWithRelations = Prisma.ExerciseGetPayload<{
  include: { aliases: true; muscles: true };
}>;

function displayName(exercise: ExerciseWithRelations): string {
  const primaries = exercise.aliases.filter((a) => a.isPrimary);
  return (
    primaries.find((a) => a.language === 'EN')?.alias ??
    primaries[0]?.alias ??
    exercise.slug
  );
}

function toListItem(exercise: ExerciseWithRelations): AdminExerciseListItemDto {
  return {
    id: exercise.id,
    slug: exercise.slug,
    name: displayName(exercise),
    category: exercise.category,
    primaryMuscle: exercise.primaryMuscle,
    equipment: exercise.equipment,
    isCustom: exercise.isCustom,
  };
}

function toDetail(exercise: ExerciseWithRelations): AdminExerciseDetailDto {
  return {
    ...toListItem(exercise),
    aliases: exercise.aliases.map((a) => ({ language: a.language, alias: a.alias, isPrimary: a.isPrimary })),
    secondaryMuscles: exercise.muscles.filter((m) => m.role === 'SECONDARY').map((m) => ({ muscle: m.muscle, weight: m.weight })),
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class AdminExercisesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async list(query: ListAdminExercisesQueryDto): Promise<PaginatedDto<AdminExerciseListItemDto>> {
    const { page, pageSize, skip, take } = paginationParams(query);

    const where: Prisma.ExerciseWhereInput = {
      ...(query.muscle ? { muscles: { some: { muscle: query.muscle } } } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.search
        ? {
            OR: [
              { slug: { contains: query.search, mode: 'insensitive' } },
              { aliases: { some: { alias: { contains: query.search, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.exercise.findMany({
        where,
        include: { aliases: true, muscles: true },
        orderBy: { slug: 'asc' },
        skip,
        take,
      }),
      this.prisma.exercise.count({ where }),
    ]);

    return { items: rows.map(toListItem), total, page, pageSize };
  }

  async detail(id: string): Promise<AdminExerciseDetailDto> {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
      include: { aliases: true, muscles: true },
    });
    if (!exercise) throw new NotFoundException('Exercise not found');
    return toDetail(exercise);
  }

  private async uniqueSlug(base: string): Promise<string> {
    let candidate = base || 'exercise';
    let suffix = 1;
    while (await this.prisma.exercise.findUnique({ where: { slug: candidate } })) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }
    return candidate;
  }

  async create(dto: CreateExerciseDto, adminId: string, ipAddress: string | null): Promise<AdminExerciseDetailDto> {
    const enPrimary = dto.aliases.find((a) => a.language === 'EN' && a.isPrimary) ?? dto.aliases.find((a) => a.language === 'EN');
    const slugBase = slugify(dto.slug ?? enPrimary?.alias ?? dto.aliases[0].alias);
    const slug = dto.slug ? dto.slug : await this.uniqueSlug(slugBase);

    const exercise = await this.prisma.$transaction(async (tx) => {
      const created = await tx.exercise.create({
        data: {
          slug,
          category: dto.category,
          primaryMuscle: dto.primaryMuscle,
          equipment: dto.equipment ?? null,
          isCustom: true,
        },
      });

      await tx.exerciseMuscle.create({
        data: { exerciseId: created.id, muscle: dto.primaryMuscle, role: 'PRIMARY', weight: 1.0 },
      });
      for (const s of dto.secondaryMuscles ?? []) {
        await tx.exerciseMuscle.create({
          data: { exerciseId: created.id, muscle: s.muscle, role: 'SECONDARY', weight: s.weight },
        });
      }

      for (const a of dto.aliases) {
        await tx.exerciseAlias.create({
          data: {
            exerciseId: created.id,
            language: a.language,
            alias: a.alias,
            normalized: normalizeExerciseText(a.alias),
            isPrimary: a.isPrimary ?? false,
          },
        });
      }

      return tx.exercise.findUniqueOrThrow({ where: { id: created.id }, include: { aliases: true, muscles: true } });
    });

    await this.auditLogService.record({
      adminId,
      action: 'EXERCISE_CREATED',
      targetType: 'Exercise',
      targetId: exercise.id,
      metadata: { slug: exercise.slug },
      ipAddress,
    });

    return toDetail(exercise);
  }

  async update(id: string, dto: UpdateExerciseDto, adminId: string, ipAddress: string | null): Promise<AdminExerciseDetailDto> {
    const existing = await this.prisma.exercise.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Exercise not found');

    const exercise = await this.prisma.$transaction(async (tx) => {
      await tx.exercise.update({
        where: { id },
        data: {
          ...(dto.slug ? { slug: dto.slug } : {}),
          ...(dto.category ? { category: dto.category } : {}),
          ...(dto.primaryMuscle ? { primaryMuscle: dto.primaryMuscle } : {}),
          ...(dto.equipment !== undefined ? { equipment: dto.equipment } : {}),
        },
      });

      if (dto.primaryMuscle || dto.secondaryMuscles) {
        const primaryMuscle = dto.primaryMuscle ?? existing.primaryMuscle;
        await tx.exerciseMuscle.deleteMany({ where: { exerciseId: id } });
        await tx.exerciseMuscle.create({ data: { exerciseId: id, muscle: primaryMuscle, role: 'PRIMARY', weight: 1.0 } });
        for (const s of dto.secondaryMuscles ?? []) {
          await tx.exerciseMuscle.create({ data: { exerciseId: id, muscle: s.muscle, role: 'SECONDARY', weight: s.weight } });
        }
      }

      if (dto.aliases) {
        await tx.exerciseAlias.deleteMany({ where: { exerciseId: id } });
        for (const a of dto.aliases) {
          await tx.exerciseAlias.create({
            data: {
              exerciseId: id,
              language: a.language,
              alias: a.alias,
              normalized: normalizeExerciseText(a.alias),
              isPrimary: a.isPrimary ?? false,
            },
          });
        }
      }

      return tx.exercise.findUniqueOrThrow({ where: { id }, include: { aliases: true, muscles: true } });
    });

    await this.auditLogService.record({
      adminId,
      action: 'EXERCISE_UPDATED',
      targetType: 'Exercise',
      targetId: id,
      metadata: { slug: exercise.slug },
      ipAddress,
    });

    return toDetail(exercise);
  }

  async remove(id: string, adminId: string, ipAddress: string | null): Promise<void> {
    const existing = await this.prisma.exercise.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Exercise not found');

    try {
      await this.prisma.exercise.delete({ where: { id } });
    } catch (err) {
      // WorkoutExercise.exerciseId is onDelete: Restrict — a catalog exercise
      // that's already logged in someone's workout history must never be
      // deletable out from under it (see schema.prisma comment).
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException('This exercise has been logged in workout history and cannot be deleted');
      }
      throw err;
    }

    await this.auditLogService.record({
      adminId,
      action: 'EXERCISE_DELETED',
      targetType: 'Exercise',
      targetId: id,
      metadata: { slug: existing.slug },
      ipAddress,
    });
  }
}
