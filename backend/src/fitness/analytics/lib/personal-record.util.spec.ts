import { detectPersonalRecords } from './personal-record.util';

describe('personal-record.util', () => {
  it('detects all four PR types on a first-ever workout for an exercise (no existing records)', () => {
    const results = detectPersonalRecords(
      [
        { weight: 35, weightUnit: 'KG', reps: 8, completed: true },
        { weight: 40, weightUnit: 'KG', reps: 7, completed: true },
        { weight: 45, weightUnit: 'KG', reps: 4, completed: true },
      ],
      [],
    );
    const types = results.map((r) => r.recordType).sort();
    expect(types).toEqual(['EST_1RM', 'MAX_REPS', 'MAX_VOLUME', 'MAX_WEIGHT']);
  });

  it('picks the heaviest weight for MAX_WEIGHT regardless of reps', () => {
    const results = detectPersonalRecords(
      [
        { weight: 45, weightUnit: 'KG', reps: 4, completed: true },
        { weight: 35, weightUnit: 'KG', reps: 8, completed: true },
      ],
      [],
    );
    const maxWeight = results.find((r) => r.recordType === 'MAX_WEIGHT');
    expect(maxWeight?.value).toBe(45);
  });

  it('picks the highest single-set volume (weight x reps) for MAX_VOLUME', () => {
    const results = detectPersonalRecords(
      [
        { weight: 100, weightUnit: 'KG', reps: 2, completed: true }, // 200
        { weight: 50, weightUnit: 'KG', reps: 10, completed: true }, // 500
      ],
      [],
    );
    const maxVolume = results.find((r) => r.recordType === 'MAX_VOLUME');
    expect(maxVolume?.value).toBe(500);
  });

  it('returns nothing when no set beats any existing record', () => {
    const results = detectPersonalRecords(
      [{ weight: 40, weightUnit: 'KG', reps: 5, completed: true }],
      [
        { recordType: 'MAX_WEIGHT', value: 60 },
        { recordType: 'MAX_REPS', value: 10 },
        { recordType: 'MAX_VOLUME', value: 500 },
        { recordType: 'EST_1RM', value: 70 },
      ],
    );
    expect(results).toEqual([]);
  });

  it('only reports the record types that were actually beaten, when all four already have baselines', () => {
    const results = detectPersonalRecords(
      [{ weight: 70, weightUnit: 'KG', reps: 3, completed: true }], // beats MAX_WEIGHT(60) but not MAX_REPS(10)
      [
        { recordType: 'MAX_WEIGHT', value: 60 },
        { recordType: 'MAX_REPS', value: 10 },
        { recordType: 'MAX_VOLUME', value: 99999 },
        { recordType: 'EST_1RM', value: 99999 },
      ],
    );
    expect(results.map((r) => r.recordType)).toEqual(['MAX_WEIGHT']);
  });

  it('ignores incomplete sets entirely', () => {
    const results = detectPersonalRecords([{ weight: 200, weightUnit: 'KG', reps: 10, completed: false }], []);
    expect(results).toEqual([]);
  });

  it('converts LB sets to KG before comparing against a KG-stored record', () => {
    // 100 lb ≈ 45.36 kg, beats an existing 40kg record.
    const results = detectPersonalRecords([{ weight: 100, weightUnit: 'LB', reps: 5, completed: true }], [
      { recordType: 'MAX_WEIGHT', value: 40 },
    ]);
    const maxWeight = results.find((r) => r.recordType === 'MAX_WEIGHT');
    expect(maxWeight?.value).toBeCloseTo(45.3592);
  });

  it('handles bodyweight/reps-only sets (no weight) for MAX_REPS without touching weight-based types', () => {
    const results = detectPersonalRecords([{ weight: null, weightUnit: 'KG', reps: 20, completed: true }], []);
    expect(results).toEqual([{ recordType: 'MAX_REPS', value: 20, weight: null, reps: 20 }]);
  });
});
