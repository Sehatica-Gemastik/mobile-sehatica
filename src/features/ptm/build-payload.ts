import type { DailyCheckin, IdentityProfile, WeeklyCheckin } from '@/features/lifestyle/types';
import type { PtmInputPayload, PtmRiskResult, PtmTarget } from '@/services/ptm-risk.service';

const TARGETS: PtmTarget[] = ['diabetes', 'hypertension', 'heart_disease', 'stroke'];

function asFiniteNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function asNonNegativeNumber(value: unknown): number | null {
  const n = asFiniteNumber(value);
  return n != null && n >= 0 ? n : null;
}

export function buildPtmPayload(
  identity: IdentityProfile | null,
  daily: DailyCheckin | null,
  weekly: WeeklyCheckin | null,
): PtmInputPayload {
  return {
    age: asFiniteNumber(identity?.age),
    sex: asFiniteNumber(identity?.sex),
    race_ethnicity: asFiniteNumber(identity?.race_ethnicity),
    education: asFiniteNumber(identity?.education),
    income_poverty_ratio: asFiniteNumber(identity?.income_poverty_ratio),
    calories_day1: daily && daily.calories_day1 >= 0 ? asNonNegativeNumber(daily.calories_day1) : null,
    protein_g_day1: daily && daily.protein_g_day1 >= 0 ? asNonNegativeNumber(daily.protein_g_day1) : null,
    carbohydrate_g_day1: daily && daily.carbohydrate_g_day1 >= 0 ? asNonNegativeNumber(daily.carbohydrate_g_day1) : null,
    sugar_g_day1: daily && daily.sugar_g_day1 >= 0 ? asNonNegativeNumber(daily.sugar_g_day1) : null,
    total_fat_g_day1: daily && daily.total_fat_g_day1 >= 0 ? asNonNegativeNumber(daily.total_fat_g_day1) : null,
    saturated_fat_g_day1: daily && daily.saturated_fat_g_day1 >= 0 ? asNonNegativeNumber(daily.saturated_fat_g_day1) : null,
    sodium_mg_day1: daily && daily.sodium_mg_day1 >= 0 ? asNonNegativeNumber(daily.sodium_mg_day1) : null,
    fiber_g_day1: daily && daily.fiber_g_day1 >= 0 ? asNonNegativeNumber(daily.fiber_g_day1) : null,
    cholesterol_mg_day1: daily && daily.cholesterol_mg_day1 >= 0 ? asNonNegativeNumber(daily.cholesterol_mg_day1) : null,
    alcohol_g_day1: daily && daily.alcohol_g_day1 >= 0 ? asNonNegativeNumber(daily.alcohol_g_day1) : null,
    vigorous_work: asFiniteNumber(daily?.vigorous_work),
    vigorous_work_days: asFiniteNumber(daily?.vigorous_work_days),
    vigorous_work_minutes: asFiniteNumber(daily?.vigorous_work_minutes),
    moderate_work: asFiniteNumber(daily?.moderate_work),
    moderate_work_days: asFiniteNumber(daily?.moderate_work_days),
    moderate_work_minutes: asFiniteNumber(daily?.moderate_work_minutes),
    transport_walking_biking: asFiniteNumber(daily?.transport_walking_biking),
    transport_days: asFiniteNumber(daily?.transport_days),
    transport_minutes: asFiniteNumber(daily?.transport_minutes),
    vigorous_recreation: asFiniteNumber(daily?.vigorous_recreation),
    vigorous_recreation_days: asFiniteNumber(daily?.vigorous_recreation_days),
    vigorous_recreation_minutes: asFiniteNumber(daily?.vigorous_recreation_minutes),
    moderate_recreation: asFiniteNumber(daily?.moderate_recreation),
    moderate_recreation_days: asFiniteNumber(daily?.moderate_recreation_days),
    moderate_recreation_minutes: asFiniteNumber(daily?.moderate_recreation_minutes),
    sedentary_minutes: asFiniteNumber(daily?.sedentary_minutes),
    vigorous_work_est_met: asFiniteNumber(daily?.vigorous_work_est_met),
    moderate_work_est_met: asFiniteNumber(daily?.moderate_work_est_met),
    transport_walking_biking_est_met: asFiniteNumber(daily?.transport_walking_biking_est_met),
    vigorous_recreation_est_met: asFiniteNumber(daily?.vigorous_recreation_est_met),
    moderate_recreation_est_met: asFiniteNumber(daily?.moderate_recreation_est_met),
    work_total_minutes: asFiniteNumber(daily?.work_total_minutes),
    recreation_total_minutes: asFiniteNumber(daily?.recreation_total_minutes),
    vigorous_total_minutes: asFiniteNumber(daily?.vigorous_total_minutes),
    moderate_total_minutes: asFiniteNumber(daily?.moderate_total_minutes),
    total_activity_minutes: asFiniteNumber(daily?.total_activity_minutes),
    total_activity_est_met: asFiniteNumber(daily?.total_activity_est_met),
    alcohol_ever: asFiniteNumber(daily?.alcohol_ever),
    alcohol_frequency: asFiniteNumber(daily?.alcohol_frequency),
    alcohol_drinks_per_day: asFiniteNumber(daily?.alcohol_drinks_per_day),
    alcohol_binge_frequency: asFiniteNumber(daily?.alcohol_binge_frequency),
    weight_kg: asFiniteNumber(weekly?.weight_kg),
    height_cm: asFiniteNumber(weekly?.height_cm),
    bmi: asFiniteNumber(weekly?.bmi),
    waist_cm: asFiniteNumber(weekly?.waist_cm),
    systolic_bp: asFiniteNumber(weekly?.systolic_bp),
    diastolic_bp: asFiniteNumber(weekly?.diastolic_bp),
  };
}

export type PtmReadinessReason = 'identity' | 'daily';

export function getPtmReadiness(payload: PtmInputPayload): {
  ready: boolean;
  reason?: PtmReadinessReason;
} {
  const identityFields = [
    payload.age,
    payload.sex,
    payload.race_ethnicity,
    payload.education,
    payload.income_poverty_ratio,
  ];
  if (identityFields.some((value) => value == null || !Number.isFinite(value))) {
    return { ready: false, reason: 'identity' };
  }

  if (
    payload.sedentary_minutes == null
    || !Number.isFinite(payload.sedentary_minutes)
    || payload.vigorous_work == null
    || !Number.isFinite(payload.vigorous_work)
    || payload.calories_day1 == null
    || !Number.isFinite(payload.calories_day1)
    || payload.calories_day1 < 0
  ) {
    return { ready: false, reason: 'daily' };
  }

  return { ready: true };
}

export function emptyPtmRiskResult(featureSet: 'lifestyle' | 'clinical' = 'lifestyle'): PtmRiskResult {
  return {
    featureSet,
    overallScore: 0,
    overallIsAtRisk: false,
    dataComplete: false,
    risks: TARGETS.map((target) => ({
      target,
      probability: 0,
      isAtRisk: false,
      threshold: 0,
    })),
  };
}
