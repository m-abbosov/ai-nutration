import { IsIn, IsObject } from 'class-validator';

/** Must match the 14 calculator ids in frontend/src/entities/calculator/lib/calculators.ts. */
export const CALCULATOR_IDS = [
  'bmi',
  'bodyfat',
  'ideal',
  'bmr',
  'tdee',
  'calories',
  'macros',
  'protein',
  'water',
  'pace',
  'burned',
  'orm',
  'hr',
  'lbm',
] as const;

export class RecordCalculatorUsageDto {
  @IsIn(CALCULATOR_IDS)
  calculatorId!: (typeof CALCULATOR_IDS)[number];

  /** Raw form inputs as entered by the visitor — shape varies per calculator. */
  @IsObject()
  inputs!: Record<string, unknown>;

  /** Computed result as shown to the visitor — shape varies per calculator. */
  @IsObject()
  result!: Record<string, unknown>;
}
