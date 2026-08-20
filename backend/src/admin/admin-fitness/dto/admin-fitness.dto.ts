import { ExerciseCategory } from '@prisma/client';

export interface SeriesPointDto {
  date: string;
  value: number;
}

export interface AdminFitnessDto {
  totals: { total: number; today: number; thisWeek: number; thisMonth: number };
  averages: { volume: number; durationMin: number; setsPerWorkout: number };
  dailyWorkouts: SeriesPointDto[];
  topExercises: { slug: string; count: number }[];
  categoryDistribution: { category: ExerciseCategory; count: number; percent: number }[];
  personalRecordsCount: number;
}
