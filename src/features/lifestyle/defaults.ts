import { MealEntry } from './food-types';
import { ActivityDraft, AlcoholDraft, DailyDraft, NutritionDraft } from './types';

export const EMPTY_ACTIVITY: ActivityDraft = {
  vigorous_work: -1,
  vigorous_work_days: 0,
  vigorous_work_minutes: 0,
  moderate_work: -1,
  moderate_work_days: 0,
  moderate_work_minutes: 0,
  transport_walking_biking: -1,
  transport_days: 0,
  transport_minutes: 0,
  vigorous_recreation: -1,
  vigorous_recreation_days: 0,
  vigorous_recreation_minutes: 0,
  moderate_recreation: -1,
  moderate_recreation_days: 0,
  moderate_recreation_minutes: 0,
  sedentary_hours: -1,
};

export const EMPTY_NUTRITION: NutritionDraft = {
  calories_day1: -1,
  protein_g_day1: -1,
  carbohydrate_g_day1: -1,
  sugar_g_day1: -1,
  total_fat_g_day1: -1,
  saturated_fat_g_day1: -1,
  sodium_mg_day1: -1,
  fiber_g_day1: -1,
  cholesterol_mg_day1: -1,
  alcohol_g_day1: -1,
};

export const EMPTY_ALCOHOL: AlcoholDraft = {
  alcohol_ever: -1,
  alcohol_frequency: -1,
  alcohol_drinks_per_day: -1,
  alcohol_binge_frequency: -1,
};

export function emptyDailyDraft(): DailyDraft {
  return {
    ...EMPTY_ACTIVITY,
    ...EMPTY_NUTRITION,
    ...EMPTY_ALCOHOL,
    meals: [],
    nutritionManual: false,
  };
}

export function dailyDraftFromCheckin(checkin: {
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
  sedentary_minutes: number;
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
  alcohol_ever: number;
  alcohol_frequency: number;
  alcohol_drinks_per_day: number;
  alcohol_binge_frequency: number;
  meals?: MealEntry[];
  nutritionManual?: boolean;
}): DailyDraft {
  return {
    vigorous_work: checkin.vigorous_work,
    vigorous_work_days: checkin.vigorous_work_days,
    vigorous_work_minutes: checkin.vigorous_work_minutes,
    moderate_work: checkin.moderate_work,
    moderate_work_days: checkin.moderate_work_days,
    moderate_work_minutes: checkin.moderate_work_minutes,
    transport_walking_biking: checkin.transport_walking_biking,
    transport_days: checkin.transport_days,
    transport_minutes: checkin.transport_minutes,
    vigorous_recreation: checkin.vigorous_recreation,
    vigorous_recreation_days: checkin.vigorous_recreation_days,
    vigorous_recreation_minutes: checkin.vigorous_recreation_minutes,
    moderate_recreation: checkin.moderate_recreation,
    moderate_recreation_days: checkin.moderate_recreation_days,
    moderate_recreation_minutes: checkin.moderate_recreation_minutes,
    sedentary_hours: checkin.sedentary_minutes / 60,
    calories_day1: checkin.calories_day1,
    protein_g_day1: checkin.protein_g_day1,
    carbohydrate_g_day1: checkin.carbohydrate_g_day1,
    sugar_g_day1: checkin.sugar_g_day1,
    total_fat_g_day1: checkin.total_fat_g_day1,
    saturated_fat_g_day1: checkin.saturated_fat_g_day1,
    sodium_mg_day1: checkin.sodium_mg_day1,
    fiber_g_day1: checkin.fiber_g_day1,
    cholesterol_mg_day1: checkin.cholesterol_mg_day1,
    alcohol_g_day1: checkin.alcohol_g_day1,
    alcohol_ever: checkin.alcohol_ever,
    alcohol_frequency: checkin.alcohol_frequency,
    alcohol_drinks_per_day: checkin.alcohol_drinks_per_day,
    alcohol_binge_frequency: checkin.alcohol_binge_frequency,
    meals: checkin.meals ?? [],
    nutritionManual: checkin.nutritionManual ?? false,
  };
}
