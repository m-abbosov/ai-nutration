import { estimateWorkoutCalories } from './calories.util';

describe('calories.util', () => {
  it('uses the MET x bodyweight x time formula when duration is known', () => {
    // MET 5 * 70kg * 1h = 350
    expect(estimateWorkoutCalories({ durationSec: 3600, totalVolumeKg: 0, bodyWeightKg: 70 })).toBe(350);
  });

  it('scales with a custom bodyweight', () => {
    // MET 5 * 90kg * 0.5h = 225
    expect(estimateWorkoutCalories({ durationSec: 1800, totalVolumeKg: 0, bodyWeightKg: 90 })).toBe(225);
  });

  it('defaults bodyweight to 70kg when not provided', () => {
    expect(estimateWorkoutCalories({ durationSec: 3600, totalVolumeKg: 0 })).toBe(350);
  });

  it('falls back to a volume-based estimate when duration is null', () => {
    // 1220kg * 0.05 = 61
    expect(estimateWorkoutCalories({ durationSec: null, totalVolumeKg: 1220 })).toBe(61);
  });

  it('falls back to volume-based estimate when duration is 0', () => {
    expect(estimateWorkoutCalories({ durationSec: 0, totalVolumeKg: 1000 })).toBe(50);
  });
});
