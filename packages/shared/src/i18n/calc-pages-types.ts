/**
 * The 14 real, working calculator pages (/calculators/:slug). Lives under
 * `Dict.calcPages`, separate from `Dict.landing` (marketing-page-only copy)
 * and `Dict.calculators` names/descriptions (card copy on the landing grid).
 * Calculator names/descriptions/synonyms already exist at `Dict.landing.calculators`
 * — this namespace only adds what a working calculator page needs: field
 * labels and result-specific copy (category names, formula names, etc).
 * Gender/activity-level/goal selects reuse the existing top-level
 * `Dict.genderLabel`/`Dict.activityLabel`/`Dict.goalLabel` — not duplicated here.
 */
export interface CalcPagesDict {
  /** Shared field labels, reused across many calculator pages. */
  fields: {
    height: string
    weight: string
    age: string
    neck: string
    waist: string
    hip: string
    distance: string
    time: string
    reps: string
    weightLifted: string
    restingHr: string
    restingHrHint: string
    exerciseMinutes: string
    hotClimate: string
    activity: string
    optional: string
  }
  calculate: string
  reset: string
  relatedTitle: string
  disclaimer: string
  resultEmptyTitle: string
  resultEmptyBody: string
  invalidInput: string

  bmi: {
    resultLabel: string
    categories: Record<'under' | 'normal' | 'over' | 'obese', string>
    meanings: Record<'under' | 'normal' | 'over' | 'obese', string>
    healthyRange: string
    bmiPrime: string
    ponderalIndex: string
    whatMeans: string
  }
  bodyfat: {
    resultLabel: string
    hipHint: string
    categories: Record<'essential' | 'athletes' | 'fitness' | 'average' | 'obese', string>
  }
  ideal: {
    resultLabel: string
    hamwi: string
    devine: string
    robinson: string
    miller: string
    recommended: string
  }
  bmr: {
    resultLabel: string
  }
  tdee: {
    resultLabel: string
  }
  calories: {
    resultLabel: string
  }
  macros: {
    resultLabel: string
  }
  protein: {
    resultLabel: string
    note: string
  }
  water: {
    resultLabel: string
    tip: string
  }
  pace: {
    distanceKm: string
    distanceMi: string
    paceMinPerKm: string
    paceMinPerMi: string
    speedKmh: string
    speedMph: string
    presets: {
      fiveK: string
      tenK: string
      halfMarathon: string
      marathon: string
      custom: string
    }
  }
  burned: {
    resultLabel: string
    activities: Record<
      | 'walkSlow'
      | 'walkModerate'
      | 'walkFast'
      | 'runModerate'
      | 'runFast'
      | 'cyclingLeisure'
      | 'cyclingModerate'
      | 'cyclingVigorous'
      | 'swimmingModerate'
      | 'swimmingVigorous'
      | 'weightLifting'
      | 'jumpRope'
      | 'basketball'
      | 'tennis'
      | 'dancing'
      | 'yoga'
      | 'hiking'
      | 'elliptical',
      string
    >
  }
  orm: {
    epley: string
    brzycki: string
    lombardi: string
  }
  hr: {
    maxHrLabel: string
    zones: Record<'zone1' | 'zone2' | 'zone3' | 'zone4' | 'zone5', string>
  }
  lbm: {
    resultLabel: string
    boer: string
    james: string
    hume: string
    fatMass: string
  }
}
