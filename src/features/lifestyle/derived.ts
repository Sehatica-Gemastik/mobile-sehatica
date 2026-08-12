import { ActivityDraft, AlcoholDraft, DerivedActivity } from './types';

export const MET_VALUES = {
  vigorous_work: 8,
  moderate_work: 4,
  transport_walking_biking: 4,
  vigorous_recreation: 8,
  moderate_recreation: 4,
} as const;

export function computeBmi(weightKg: number, heightCm: number): number | null {
  if (!(weightKg > 0) || !(heightCm > 0)) return null;
  const meters = heightCm / 100;
  return Math.round((weightKg / (meters * meters)) * 10) / 10;
}

function flaggedMinutes(flag: number, days: number, minutes: number): { days: number; minutes: number } {
  if (flag !== 1) return { days: 0, minutes: 0 };
  return {
    days: Math.max(0, days),
    minutes: Math.max(0, minutes),
  };
}

function estMet(flag: number, days: number, minutes: number, met: number): number {
  const safe = flaggedMinutes(flag, days, minutes);
  return met * safe.days * safe.minutes;
}

export function deriveActivity(draft: ActivityDraft): DerivedActivity {
  const vigorousWork = flaggedMinutes(draft.vigorous_work, draft.vigorous_work_days, draft.vigorous_work_minutes);
  const moderateWork = flaggedMinutes(draft.moderate_work, draft.moderate_work_days, draft.moderate_work_minutes);
  const transport = flaggedMinutes(draft.transport_walking_biking, draft.transport_days, draft.transport_minutes);
  const vigorousRec = flaggedMinutes(draft.vigorous_recreation, draft.vigorous_recreation_days, draft.vigorous_recreation_minutes);
  const moderateRec = flaggedMinutes(draft.moderate_recreation, draft.moderate_recreation_days, draft.moderate_recreation_minutes);

  const vigorous_work_est_met = estMet(draft.vigorous_work, draft.vigorous_work_days, draft.vigorous_work_minutes, MET_VALUES.vigorous_work);
  const moderate_work_est_met = estMet(draft.moderate_work, draft.moderate_work_days, draft.moderate_work_minutes, MET_VALUES.moderate_work);
  const transport_walking_biking_est_met = estMet(draft.transport_walking_biking, draft.transport_days, draft.transport_minutes, MET_VALUES.transport_walking_biking);
  const vigorous_recreation_est_met = estMet(draft.vigorous_recreation, draft.vigorous_recreation_days, draft.vigorous_recreation_minutes, MET_VALUES.vigorous_recreation);
  const moderate_recreation_est_met = estMet(draft.moderate_recreation, draft.moderate_recreation_days, draft.moderate_recreation_minutes, MET_VALUES.moderate_recreation);

  return {
    vigorous_work_est_met,
    moderate_work_est_met,
    transport_walking_biking_est_met,
    vigorous_recreation_est_met,
    moderate_recreation_est_met,
    work_total_minutes: vigorousWork.minutes + moderateWork.minutes,
    recreation_total_minutes: vigorousRec.minutes + moderateRec.minutes,
    vigorous_total_minutes: vigorousWork.minutes + vigorousRec.minutes,
    moderate_total_minutes: moderateWork.minutes + moderateRec.minutes,
    total_activity_minutes:
      vigorousWork.minutes + moderateWork.minutes + transport.minutes + vigorousRec.minutes + moderateRec.minutes,
    total_activity_est_met:
      vigorous_work_est_met
      + moderate_work_est_met
      + transport_walking_biking_est_met
      + vigorous_recreation_est_met
      + moderate_recreation_est_met,
    sedentary_minutes: Math.max(0, draft.sedentary_hours) * 60,
  };
}

export function normalizeAlcohol(draft: AlcoholDraft): AlcoholDraft {
  if (draft.alcohol_ever !== 1) {
    return {
      alcohol_ever: 0,
      alcohol_frequency: 0,
      alcohol_drinks_per_day: 0,
      alcohol_binge_frequency: 0,
    };
  }
  return { ...draft, alcohol_ever: 1 };
}

export function daysSince(iso: string, now = new Date()): number {
  const then = new Date(iso);
  const start = Date.UTC(then.getFullYear(), then.getMonth(), then.getDate());
  const end = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((end - start) / 86_400_000);
}

export function isWeeklyDue(completedAt: string | null | undefined, now = new Date()): boolean {
  if (!completedAt) return true;
  return daysSince(completedAt, now) >= 7;
}
