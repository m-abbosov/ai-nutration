import { calculateMuscleBalance } from './muscle-balance.util';

describe('muscle-balance.util', () => {
  it('splits volume into push/pull/legs/core buckets and percentages that sum to 100', () => {
    const result = calculateMuscleBalance({
      CHEST: 3000, // push
      BACK: 1000, // pull
      QUADS: 4000, // legs
      ABS: 2000, // core
    });
    expect(result.push.volume).toBe(3000);
    expect(result.pull.volume).toBe(1000);
    expect(result.legs.volume).toBe(4000);
    expect(result.core.volume).toBe(2000);

    const totalPct = result.push.percentage + result.pull.percentage + result.legs.percentage + result.core.percentage;
    expect(totalPct).toBeCloseTo(100, 0);
  });

  it('sums multiple muscles within the same group', () => {
    const result = calculateMuscleBalance({ CHEST: 1000, TRICEPS: 500, SHOULDERS: 500 });
    expect(result.push.volume).toBe(2000);
  });

  it('returns all-zero percentages instead of NaN when there is no volume at all', () => {
    const result = calculateMuscleBalance({});
    expect(result.push).toEqual({ volume: 0, percentage: 0 });
    expect(result.pull).toEqual({ volume: 0, percentage: 0 });
    expect(result.legs).toEqual({ volume: 0, percentage: 0 });
    expect(result.core).toEqual({ volume: 0, percentage: 0 });
  });

  it('reflects a real push-dominant imbalance in the percentages', () => {
    const result = calculateMuscleBalance({ CHEST: 8000, BACK: 1000 });
    expect(result.push.percentage).toBeGreaterThan(result.pull.percentage);
  });
});
