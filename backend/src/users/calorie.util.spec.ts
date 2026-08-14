import { calculateBmr, calculateCalorieTargets } from './calorie.util';

describe('calorie.util', () => {
  it('computes BMR for MALE per Mifflin-St Jeor', () => {
    // 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75
    expect(calculateBmr('MALE', 70, 175, 30)).toBeCloseTo(1648.75);
  });

  it('computes BMR for FEMALE per Mifflin-St Jeor', () => {
    // 10*60 + 6.25*165 - 5*28 - 161 = 600 + 1031.25 - 140 - 161 = 1330.25
    expect(calculateBmr('FEMALE', 60, 165, 28)).toBeCloseTo(1330.25);
  });

  it('computes BMR for OTHER as the MALE formula minus 78', () => {
    const male = calculateBmr('MALE', 70, 175, 30);
    expect(calculateBmr('OTHER', 70, 175, 30)).toBeCloseTo(male - 78);
  });

  it('applies activity multiplier and LOSE goal adjustment (-500 kcal)', () => {
    const result = calculateCalorieTargets({
      age: 30,
      heightCm: 175,
      weightKg: 70,
      gender: 'MALE',
      activityLevel: 'MODERATE',
      goal: 'LOSE',
    });
    const bmr = 1648.75;
    const tdee = bmr * 1.55;
    const expectedTarget = Math.round(tdee - 500);
    expect(result.dailyCalorieTarget).toBe(expectedTarget);
  });

  it('splits macros 25/45/30 of target kcal', () => {
    const result = calculateCalorieTargets({
      age: 30,
      heightCm: 175,
      weightKg: 70,
      gender: 'MALE',
      activityLevel: 'SEDENTARY',
      goal: 'MAINTAIN',
    });
    const target = result.dailyCalorieTarget;
    expect(result.proteinTargetG).toBe(Math.round((target * 0.25) / 4));
    expect(result.carbsTargetG).toBe(Math.round((target * 0.45) / 4));
    expect(result.fatTargetG).toBe(Math.round((target * 0.3) / 9));
  });

  it('applies GAIN goal adjustment (+300 kcal)', () => {
    const bmr = calculateBmr('FEMALE', 60, 165, 28);
    const tdee = bmr * 1.375;
    const result = calculateCalorieTargets({
      age: 28,
      heightCm: 165,
      weightKg: 60,
      gender: 'FEMALE',
      activityLevel: 'LIGHT',
      goal: 'GAIN',
    });
    expect(result.dailyCalorieTarget).toBe(Math.round(tdee + 300));
  });
});
