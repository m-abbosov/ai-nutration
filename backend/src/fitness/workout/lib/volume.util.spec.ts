import { calculateSetVolume, calculateTotalVolume, toKg } from './volume.util';

describe('volume.util', () => {
  describe('toKg', () => {
    it('leaves KG weights unchanged', () => {
      expect(toKg(60, 'KG')).toBe(60);
    });

    it('converts LB to KG', () => {
      expect(toKg(100, 'LB')).toBeCloseTo(45.3592);
    });
  });

  describe('calculateSetVolume', () => {
    it('multiplies weight by reps for a completed KG set', () => {
      expect(calculateSetVolume({ weight: 60, weightUnit: 'KG', reps: 8, completed: true })).toBe(480);
    });

    it('converts LB sets to KG before multiplying', () => {
      const result = calculateSetVolume({ weight: 100, weightUnit: 'LB', reps: 10, completed: true });
      expect(result).toBeCloseTo(453.592);
    });

    it('returns 0 for an incomplete set', () => {
      expect(calculateSetVolume({ weight: 60, weightUnit: 'KG', reps: 8, completed: false })).toBe(0);
    });

    it('returns 0 when weight is null (e.g. a bodyweight/duration-only set)', () => {
      expect(calculateSetVolume({ weight: null, weightUnit: 'KG', reps: 8, completed: true })).toBe(0);
    });

    it('returns 0 when reps is null', () => {
      expect(calculateSetVolume({ weight: 60, weightUnit: 'KG', reps: null, completed: true })).toBe(0);
    });
  });

  describe('calculateTotalVolume', () => {
    it('sums volume across multiple exercises and sets', () => {
      const total = calculateTotalVolume([
        {
          sets: [
            { weight: 35, weightUnit: 'KG', reps: 8, completed: true },
            { weight: 40, weightUnit: 'KG', reps: 7, completed: true },
            { weight: 45, weightUnit: 'KG', reps: 4, completed: true },
          ],
        },
        {
          sets: [
            { weight: 60, weightUnit: 'KG', reps: 8, completed: true },
          ],
        },
      ]);
      // 35*8 + 40*7 + 45*4 + 60*8 = 280 + 280 + 180 + 480 = 1220
      expect(total).toBe(1220);
    });

    it('returns 0 for an empty workout', () => {
      expect(calculateTotalVolume([])).toBe(0);
    });

    it('ignores incomplete sets in the total', () => {
      const total = calculateTotalVolume([
        {
          sets: [
            { weight: 60, weightUnit: 'KG', reps: 8, completed: true },
            { weight: 100, weightUnit: 'KG', reps: 10, completed: false },
          ],
        },
      ]);
      expect(total).toBe(480);
    });
  });
});
