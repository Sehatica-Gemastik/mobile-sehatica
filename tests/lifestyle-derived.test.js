import { describe, expect, test } from 'bun:test';
import { computeBmi, deriveActivity, isWeeklyDue, normalizeAlcohol } from '../src/features/lifestyle/derived';

describe('lifestyle derived features', () => {
  test('computes bmi from weight and height', () => {
    expect(computeBmi(70, 170)).toBe(24.2);
    expect(computeBmi(0, 170)).toBeNull();
    expect(computeBmi(70, 0)).toBeNull();
  });

  test('zeros activity branches when the flag is off', () => {
    const derived = deriveActivity({
      vigorous_work: 0,
      vigorous_work_days: 5,
      vigorous_work_minutes: 40,
      moderate_work: 1,
      moderate_work_days: 2,
      moderate_work_minutes: 30,
      transport_walking_biking: 0,
      transport_days: 5,
      transport_minutes: 20,
      vigorous_recreation: 0,
      vigorous_recreation_days: 3,
      vigorous_recreation_minutes: 45,
      moderate_recreation: 1,
      moderate_recreation_days: 3,
      moderate_recreation_minutes: 20,
      sedentary_hours: 6,
    });

    expect(derived.vigorous_work_est_met).toBe(0);
    expect(derived.moderate_work_est_met).toBe(4 * 2 * 30);
    expect(derived.transport_walking_biking_est_met).toBe(0);
    expect(derived.work_total_minutes).toBe(30);
    expect(derived.recreation_total_minutes).toBe(20);
    expect(derived.total_activity_minutes).toBe(50);
    expect(derived.sedentary_minutes).toBe(360);
  });

  test('hides alcohol follow-up fields when the user never drank', () => {
    expect(normalizeAlcohol({
      alcohol_ever: 0,
      alcohol_frequency: 3,
      alcohol_drinks_per_day: 2,
      alcohol_binge_frequency: 1,
    })).toEqual({
      alcohol_ever: 0,
      alcohol_frequency: 0,
      alcohol_drinks_per_day: 0,
      alcohol_binge_frequency: 0,
    });
  });

  test('marks weekly check-in due after seven days', () => {
    expect(isWeeklyDue(null)).toBe(true);
    expect(isWeeklyDue('2026-08-12T00:00:00.000Z', new Date('2026-08-12T12:00:00.000Z'))).toBe(false);
    expect(isWeeklyDue('2026-08-05T00:00:00.000Z', new Date('2026-08-12T12:00:00.000Z'))).toBe(true);
  });
});
