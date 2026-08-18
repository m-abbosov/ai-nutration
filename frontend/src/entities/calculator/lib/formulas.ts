import type { ActivityLevel, Gender } from '@nutriai/shared/api/types'

// ── BMI ──────────────────────────────────────────────────────────────────
// calculator.net: BMI = kg / (m)². Category cutoffs, BMI Prime, and Ponderal
// Index also match calculator.net's published "Other Result" figures.

export type BmiCategory = 'under' | 'normal' | 'over' | 'obese'

export interface BmiResult {
  bmi: number
  category: BmiCategory
  bmiPrime: number
  ponderalIndex: number
  healthyMinKg: number
  healthyMaxKg: number
  /** 0-100, clamped, for a gauge spanning BMI 15-40. */
  markerPct: number
}

export function calculateBmi(heightCm: number, weightKg: number): BmiResult {
  const h = heightCm / 100
  const bmi = weightKg / (h * h)
  const category: BmiCategory = bmi < 18.5 ? 'under' : bmi < 25 ? 'normal' : bmi < 30 ? 'over' : 'obese'
  return {
    bmi,
    category,
    bmiPrime: bmi / 25,
    ponderalIndex: weightKg / (h * h * h),
    healthyMinKg: 18.5 * h * h,
    healthyMaxKg: 24.9 * h * h,
    markerPct: Math.max(0, Math.min(100, ((bmi - 15) / 25) * 100)),
  }
}

// ── Body fat (US Navy method) ───────────────────────────────────────────
// calculator.net: formula is calibrated in inches. Men need waist+neck+height;
// women additionally need hip. Categories per the American Council on Exercise.

export type BodyFatCategory = 'essential' | 'athletes' | 'fitness' | 'average' | 'obese'

export interface BodyFatResult {
  bodyFatPercent: number
  category: BodyFatCategory
}

export function calculateBodyFat(
  gender: Gender,
  heightCm: number,
  neckCm: number,
  waistCm: number,
  hipCm?: number,
): BodyFatResult {
  const CM_TO_IN = 1 / 2.54
  const h = heightCm * CM_TO_IN
  const neck = neckCm * CM_TO_IN
  const waist = waistCm * CM_TO_IN
  const isFemale = gender === 'FEMALE'

  let bf: number
  if (isFemale) {
    const hip = (hipCm ?? 0) * CM_TO_IN
    bf = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(h) - 78.387
  } else {
    bf = 86.01 * Math.log10(waist - neck) - 70.041 * Math.log10(h) + 36.76
  }
  bf = Math.max(0, bf)

  const category: BodyFatCategory = isFemale
    ? bf <= 13
      ? 'essential'
      : bf <= 20
        ? 'athletes'
        : bf <= 24
          ? 'fitness'
          : bf <= 31
            ? 'average'
            : 'obese'
    : bf <= 5
      ? 'essential'
      : bf <= 13
        ? 'athletes'
        : bf <= 17
          ? 'fitness'
          : bf <= 24
            ? 'average'
            : 'obese'

  return { bodyFatPercent: bf, category }
}

// ── Ideal weight ─────────────────────────────────────────────────────────
// calculator.net: 4 formulas, all `base_kg + coefficient × inches over 5ft`.
// Devine is the page's own "most widely used" pick.

export interface IdealWeightResult {
  hamwiKg: number
  devineKg: number
  robinsonKg: number
  millerKg: number
}

export function calculateIdealWeight(gender: Gender, heightCm: number): IdealWeightResult {
  const totalInches = heightCm / 2.54
  const overInches = Math.max(0, totalInches - 60)
  const isFemale = gender === 'FEMALE'
  return {
    hamwiKg: (isFemale ? 45.5 : 48.0) + (isFemale ? 2.2 : 2.7) * overInches,
    devineKg: (isFemale ? 45.5 : 50.0) + 2.3 * overInches,
    robinsonKg: (isFemale ? 49 : 52) + (isFemale ? 1.7 : 1.9) * overInches,
    millerKg: (isFemale ? 53.1 : 56.2) + (isFemale ? 1.36 : 1.41) * overInches,
  }
}

// ── Protein ──────────────────────────────────────────────────────────────
// calculator.net cites a 0.8-1.8 g/kg range depending on activity level;
// tier mapping onto the app's existing 4-level ActivityLevel enum.

const PROTEIN_G_PER_KG: Record<ActivityLevel, number> = {
  SEDENTARY: 0.8,
  LIGHT: 1.0,
  MODERATE: 1.3,
  ACTIVE: 1.6,
}

export interface ProteinResult {
  proteinG: number
  gPerKg: number
}

export function calculateProtein(weightKg: number, activityLevel: ActivityLevel): ProteinResult {
  const gPerKg = PROTEIN_G_PER_KG[activityLevel]
  return { proteinG: Math.round(weightKg * gPerKg), gPerKg }
}

// ── Water intake ─────────────────────────────────────────────────────────
// calculator.net has no water-intake calculator; standard 33 ml/kg baseline
// plus exercise/climate additions (Mayo Clinic-style guidance).

export function calculateWaterLiters(weightKg: number, exerciseMinutes: number, hotClimate: boolean): number {
  const base = weightKg * 0.033
  const exercise = (exerciseMinutes / 30) * 0.4
  const climate = hotClimate ? 0.5 : 0
  return base + exercise + climate
}

// ── Pace ─────────────────────────────────────────────────────────────────
// calculator.net: pure unit conversion, pace = time/distance, speed = distance/time.

const KM_TO_MI = 0.621371

export interface PaceResult {
  paceMinPerKm: number
  paceMinPerMi: number
  speedKmh: number
  speedMph: number
}

export function calculatePace(distanceKm: number, totalMinutes: number): PaceResult {
  const speedKmh = distanceKm / (totalMinutes / 60)
  const distanceMi = distanceKm * KM_TO_MI
  return {
    paceMinPerKm: totalMinutes / distanceKm,
    paceMinPerMi: totalMinutes / distanceMi,
    speedKmh,
    speedMph: speedKmh * KM_TO_MI,
  }
}

/** Decimal minutes -> "m:ss" clock string, for pace/time display. */
export function formatMinutesToClock(totalMinutes: number): string {
  const totalSeconds = Math.round(totalMinutes * 60)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export const RACE_PRESETS_KM = {
  fiveK: 5,
  tenK: 10,
  halfMarathon: 21.0975,
  marathon: 42.195,
} as const

// ── Calories burned ──────────────────────────────────────────────────────
// calculator.net's own stated formula: Calories = Time(min) × MET × Weight(kg) / 200.
// MET values below are the public 2011 Compendium of Physical Activities figures
// (calculator.net's own cited data source); walkSlow/tennis/jumpRope match the
// three MET examples calculator.net's page states verbatim (2.0 / 5.0 / 11.0).

export const MET_ACTIVITIES = [
  { id: 'walkSlow', met: 2.0 },
  { id: 'walkModerate', met: 3.5 },
  { id: 'walkFast', met: 4.3 },
  { id: 'runModerate', met: 8.3 },
  { id: 'runFast', met: 11.0 },
  { id: 'cyclingLeisure', met: 4.0 },
  { id: 'cyclingModerate', met: 8.0 },
  { id: 'cyclingVigorous', met: 10.0 },
  { id: 'swimmingModerate', met: 5.8 },
  { id: 'swimmingVigorous', met: 9.8 },
  { id: 'weightLifting', met: 3.5 },
  { id: 'jumpRope', met: 11.0 },
  { id: 'basketball', met: 6.5 },
  { id: 'tennis', met: 5.0 },
  { id: 'dancing', met: 4.8 },
  { id: 'yoga', met: 2.5 },
  { id: 'hiking', met: 6.0 },
  { id: 'elliptical', met: 5.0 },
] as const

export type MetActivityId = (typeof MET_ACTIVITIES)[number]['id']

export function calculateCaloriesBurned(met: number, weightKg: number, durationMinutes: number): number {
  return (durationMinutes * met * weightKg) / 200
}

// ── One rep max ───────────────────────────────────────────────────────────
// calculator.net offers exactly 3 formulas (Epley default, Brzycki, Lombardi).

export interface OneRepMaxResult {
  epley: number
  brzycki: number | null
  lombardi: number
}

export function calculateOneRepMax(weightLifted: number, reps: number): OneRepMaxResult {
  return {
    epley: weightLifted * (1 + reps / 30),
    brzycki: reps < 37 ? (weightLifted * 36) / (37 - reps) : null,
    lombardi: weightLifted * Math.pow(reps, 0.1),
  }
}

// ── Target heart rate ────────────────────────────────────────────────────
// calculator.net default: MHR = 220 - age (Haskell & Fox). Karvonen formula
// when resting HR is supplied; simple %MHR otherwise. 5 zones, 50-100% MHR.

export interface HrZoneResult {
  minBpm: number
  maxBpm: number
}

export interface HeartRateResult {
  maxHr: number
  /** 5 zones: 50-60 / 60-70 / 70-80 / 80-90 / 90-100% of max HR. */
  zones: HrZoneResult[]
}

const HR_ZONE_BOUNDS = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0]

export function calculateHeartRateZones(age: number, restingHr?: number): HeartRateResult {
  const maxHr = 220 - age
  const zones: HrZoneResult[] = []
  for (let i = 0; i < 5; i++) {
    const loPct = HR_ZONE_BOUNDS[i]
    const hiPct = HR_ZONE_BOUNDS[i + 1]
    const at = (pct: number) => (restingHr != null ? pct * (maxHr - restingHr) + restingHr : pct * maxHr)
    zones.push({ minBpm: Math.round(at(loPct)), maxBpm: Math.round(at(hiPct)) })
  }
  return { maxHr, zones }
}

// ── Lean body mass ────────────────────────────────────────────────────────
// calculator.net: Boer (primary), James, Hume formulas.

export interface LeanBodyMassResult {
  boerKg: number
  jamesKg: number
  humeKg: number
  fatMassKg: number
}

export function calculateLeanBodyMass(gender: Gender, heightCm: number, weightKg: number): LeanBodyMassResult {
  const isFemale = gender === 'FEMALE'
  const boerKg = isFemale
    ? 0.252 * weightKg + 0.473 * heightCm - 48.3
    : 0.407 * weightKg + 0.267 * heightCm - 19.2
  const jamesKg = isFemale
    ? 1.07 * weightKg - 148 * Math.pow(weightKg / heightCm, 2)
    : 1.1 * weightKg - 128 * Math.pow(weightKg / heightCm, 2)
  const humeKg = isFemale
    ? 0.29569 * weightKg + 0.41813 * heightCm - 43.2933
    : 0.3281 * weightKg + 0.33929 * heightCm - 29.5336
  return { boerKg, jamesKg, humeKg, fatMassKg: Math.max(0, weightKg - boerKg) }
}
