import { MealEntry } from './food-types';

export type IdentityProfile = {
  age: number;
  sex: number;
  race_ethnicity: number;
  education: number;
  income_poverty_ratio: number;
  completedAt: string;
};

export type WeeklyCheckin = {
  weight_kg: number;
  height_cm: number;
  bmi: number;
  waist_cm: number;
  systolic_bp: number;
  diastolic_bp: number;
  completedAt: string;
};

export type ActivityDraft = {
  vigorous_work: number;
  vigorous_work_days: number;
  vigorous_work_minutes: number;
  moderate_work: number;
  moderate_work_days: number;
  moderate_work_minutes: number;
  transport_walking_biking: number;
  transport_days: number;
  transport_minutes: number;
  vigorous_recreation: number;
  vigorous_recreation_days: number;
  vigorous_recreation_minutes: number;
  moderate_recreation: number;
  moderate_recreation_days: number;
  moderate_recreation_minutes: number;
  sedentary_hours: number;
};

export type NutritionDraft = {
  calories_day1: number;
  protein_g_day1: number;
  carbohydrate_g_day1: number;
  sugar_g_day1: number;
  total_fat_g_day1: number;
  saturated_fat_g_day1: number;
  sodium_mg_day1: number;
  fiber_g_day1: number;
  cholesterol_mg_day1: number;
  alcohol_g_day1: number;
};

export type { MealEntry, MealType } from './food-types';

export type AlcoholDraft = {
  alcohol_ever: number;
  alcohol_frequency: number;
  alcohol_drinks_per_day: number;
  alcohol_binge_frequency: number;
};

export type DailyDraft = ActivityDraft & NutritionDraft & AlcoholDraft & {
  meals: MealEntry[];
  nutritionManual: boolean;
};

export type DerivedActivity = {
  vigorous_work_est_met: number;
  moderate_work_est_met: number;
  transport_walking_biking_est_met: number;
  vigorous_recreation_est_met: number;
  moderate_recreation_est_met: number;
  work_total_minutes: number;
  recreation_total_minutes: number;
  vigorous_total_minutes: number;
  moderate_total_minutes: number;
  total_activity_minutes: number;
  total_activity_est_met: number;
  sedentary_minutes: number;
};

export type DailyCheckin = Omit<DailyDraft, 'sedentary_hours'> & DerivedActivity & {
  date: string;
  completedAt: string;
};

export type LifestyleProfile = {
  weekly: WeeklyCheckin | null;
  daily: DailyCheckin | null;
};
