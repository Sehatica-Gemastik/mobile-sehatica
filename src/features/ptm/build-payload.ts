import type { DailyCheckin, IdentityProfile, WeeklyCheckin } from '@/features/lifestyle/types';
import type { PtmInputPayload, PtmRiskResult, PtmTarget } from '@/services/ptm-risk.service';

const TARGETS: PtmTarget[] = ['diabetes', 'hypertension', 'heart_disease', 'stroke'];

export function buildPtmPayload(
  identity: IdentityProfile | null,
  daily: DailyCheckin | null,
  weekly: WeeklyCheckin | null,
): PtmInputPayload {
  return {
    age: identity?.age ?? null,
    sex: identity?.sex ?? null,
    race_ethnicity: identity?.race_ethnicity ?? null,
    education: identity?.education ?? null,
    income_poverty_ratio: identity?.income_poverty_ratio ?? null,
    calories_day1: daily && daily.calories_day1 >= 0 ? daily.calories_day1 : null,
    protein_g_day1: daily && daily.protein_g_day1 >= 0 ? daily.protein_g_day1 : null,
    carbohydrate_g_day1: daily && daily.carbohydrate_g_day1 >= 0 ? daily.carbohydrate_g_day1 : null,
    sugar_g_day1: daily && daily.sugar_g_day1 >= 0 ? daily.sugar_g_day1 : null,
    total_fat_g_day1: daily && daily.total_fat_g_day1 >= 0 ? daily.total_fat_g_day1 : null,
    saturated_fat_g_day1: daily && daily.saturated_fat_g_day1 >= 0 ? daily.saturated_fat_g_day1 : null,
    sodium_mg_day1: daily && daily.sodium_mg_day1 >= 0 ? daily.sodium_mg_day1 : null,
    fiber_g_day1: daily && daily.fiber_g_day1 >= 0 ? daily.fiber_g_day1 : null,
    cholesterol_mg_day1: daily && daily.cholesterol_mg_day1 >= 0 ? daily.cholesterol_mg_day1 : null,
    alcohol_g_day1: daily && daily.alcohol_g_day1 >= 0 ? daily.alcohol_g_day1 : null,
    vigorous_work: daily?.vigorous_work ?? null,
    vigorous_work_days: daily?.vigorous_work_days ?? null,
    vigorous_work_minutes: daily?.vigorous_work_minutes ?? null,
    moderate_work: daily?.moderate_work ?? null,
    moderate_work_days: daily?.moderate_work_days ?? null,
    moderate_work_minutes: daily?.moderate_work_minutes ?? null,
    transport_walking_biking: daily?.transport_walking_biking ?? null,
    transport_days: daily?.transport_days ?? null,
    transport_minutes: daily?.transport_minutes ?? null,
    vigorous_recreation: daily?.vigorous_recreation ?? null,
    vigorous_recreation_days: daily?.vigorous_recreation_days ?? null,
    vigorous_recreation_minutes: daily?.vigorous_recreation_minutes ?? null,
    moderate_recreation: daily?.moderate_recreation ?? null,
    moderate_recreation_days: daily?.moderate_recreation_days ?? null,
    moderate_recreation_minutes: daily?.moderate_recreation_minutes ?? null,
    sedentary_minutes: daily?.sedentary_minutes ?? null,
    vigorous_work_est_met: daily?.vigorous_work_est_met ?? null,
    moderate_work_est_met: daily?.moderate_work_est_met ?? null,
    transport_walking_biking_est_met: daily?.transport_walking_biking_est_met ?? null,
    vigorous_recreation_est_met: daily?.vigorous_recreation_est_met ?? null,
    moderate_recreation_est_met: daily?.moderate_recreation_est_met ?? null,
    work_total_minutes: daily?.work_total_minutes ?? null,
    recreation_total_minutes: daily?.recreation_total_minutes ?? null,
    vigorous_total_minutes: daily?.vigorous_total_minutes ?? null,
    moderate_total_minutes: daily?.moderate_total_minutes ?? null,
    total_activity_minutes: daily?.total_activity_minutes ?? null,
    total_activity_est_met: daily?.total_activity_est_met ?? null,
    alcohol_ever: daily?.alcohol_ever ?? null,
    alcohol_frequency: daily?.alcohol_frequency ?? null,
    alcohol_drinks_per_day: daily?.alcohol_drinks_per_day ?? null,
    alcohol_binge_frequency: daily?.alcohol_binge_frequency ?? null,
    weight_kg: weekly?.weight_kg ?? null,
    height_cm: weekly?.height_cm ?? null,
    bmi: weekly?.bmi ?? null,
    waist_cm: weekly?.waist_cm ?? null,
    systolic_bp: weekly?.systolic_bp ?? null,
    diastolic_bp: weekly?.diastolic_bp ?? null,
  };
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
