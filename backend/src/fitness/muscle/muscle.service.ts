import { Injectable } from '@nestjs/common';
import { MuscleCode } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { MuscleDetailDto } from '../progress/dto/muscle-progress-response.dto';
import { ProgressService } from '../progress/progress.service';
import { MuscleTaxonomyDto } from './dto/muscle-taxonomy-response.dto';

@Injectable()
export class MuscleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progressService: ProgressService,
  ) {}

  async list(): Promise<MuscleTaxonomyDto[]> {
    const groups = await this.prisma.muscleGroup.findMany({ orderBy: { sortOrder: 'asc' } });
    return groups.map((g) => ({ muscle: g.code, region: g.region, sortOrder: g.sortOrder }));
  }

  getDetail(userId: string, muscle: MuscleCode): Promise<MuscleDetailDto> {
    return this.progressService.getMuscleDetail(userId, muscle);
  }
}
