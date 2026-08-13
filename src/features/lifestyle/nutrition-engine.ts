import { MealEntry } from './food-types';
import { getFoodById } from './food-catalog';
import { NutritionDraft } from './types';
import { NUTRITION_FIELDS } from './options';

const EMPTY: NutritionDraft = {
  calories_day1: 0,
  protein_g_day1: 0,
  carbohydrate_g_day1: 0,
  sugar_g_day1: 0,
  total_fat_g_day1: 0,
  saturated_fat_g_day1: 0,
  sodium_mg_day1: 0,
  fiber_g_day1: 0,
  cholesterol_mg_day1: 0,
  alcohol_g_day1: 0,
};

function roundNutrition(value: NutritionDraft): NutritionDraft {
  return {
    calories_day1: Math.round(value.calories_day1),
    protein_g_day1: Math.round(value.protein_g_day1 * 10) / 10,
    carbohydrate_g_day1: Math.round(value.carbohydrate_g_day1 * 10) / 10,
    sugar_g_day1: Math.round(value.sugar_g_day1 * 10) / 10,
    total_fat_g_day1: Math.round(value.total_fat_g_day1 * 10) / 10,
    saturated_fat_g_day1: Math.round(value.saturated_fat_g_day1 * 10) / 10,
    sodium_mg_day1: Math.round(value.sodium_mg_day1),
    fiber_g_day1: Math.round(value.fiber_g_day1 * 10) / 10,
    cholesterol_mg_day1: Math.round(value.cholesterol_mg_day1),
    alcohol_g_day1: Math.round(value.alcohol_g_day1 * 10) / 10,
  };
}

export function sumMealNutrition(meals: MealEntry[]): NutritionDraft {
  const totals = { ...EMPTY };
  for (const entry of meals) {
    const food = getFoodById(entry.foodId);
    if (!food || entry.servings <= 0) continue;
    const servings = entry.servings;
    totals.calories_day1 += food.nutrition.calories * servings;
    totals.protein_g_day1 += food.nutrition.protein_g * servings;
    totals.carbohydrate_g_day1 += food.nutrition.carbohydrate_g * servings;
    totals.sugar_g_day1 += food.nutrition.sugar_g * servings;
    totals.total_fat_g_day1 += food.nutrition.total_fat_g * servings;
    totals.saturated_fat_g_day1 += food.nutrition.saturated_fat_g * servings;
    totals.sodium_mg_day1 += food.nutrition.sodium_mg * servings;
    totals.fiber_g_day1 += food.nutrition.fiber_g * servings;
    totals.cholesterol_mg_day1 += food.nutrition.cholesterol_mg * servings;
    totals.alcohol_g_day1 += food.nutrition.alcohol_g * servings;
  }
  return roundNutrition(totals);
}

export function isManualNutritionComplete(nutrition: NutritionDraft): boolean {
  return NUTRITION_FIELDS.every((field) => Number.isFinite(nutrition[field.key]) && nutrition[field.key] >= 0);
}

export function resolveDailyNutrition(input: {
  meals: MealEntry[];
  nutritionManual: boolean;
} & NutritionDraft): NutritionDraft {
  if (input.nutritionManual && isManualNutritionComplete(input)) {
    const manual = {} as NutritionDraft;
    for (const field of NUTRITION_FIELDS) {
      manual[field.key] = input[field.key];
    }
    return roundNutrition(manual);
  }
  if (input.meals.length > 0) {
    return sumMealNutrition(input.meals);
  }
  return {
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
}

/** Fix daily records that lost calorie totals but still have meals. */
export function hydrateDailyNutrition<T extends {
  meals?: MealEntry[];
  nutritionManual?: boolean;
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
}>(daily: T): T {
  if (daily.calories_day1 >= 0) return daily;
  const meals = daily.meals ?? [];
  if (meals.length === 0) return daily;
  return {
    ...daily,
    ...sumMealNutrition(meals),
    nutritionManual: false,
  };
}

export function isNutritionReady(input: {
  meals: MealEntry[];
  nutritionManual: boolean;
} & NutritionDraft): boolean {
  if (input.meals.length > 0) return true;
  return input.nutritionManual && isManualNutritionComplete(input);
}
