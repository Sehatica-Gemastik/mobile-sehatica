import { expect, test } from 'bun:test';
import { scheduleReminderDate } from '../src/utils/schedule-reminder';

test('builds a local reminder date only from valid schedule values', () => {
  expect(scheduleReminderDate('2026-08-09', '07:30')?.getHours()).toBe(7);
  expect(scheduleReminderDate('2026-08-09', '25:00')).toBeNull();
  expect(scheduleReminderDate('not-a-date', '07:30')).toBeNull();
});
