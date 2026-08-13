import { describe, expect, test } from 'bun:test';
import { isNutritionReady, resolveDailyNutrition, sumMealNutrition } from '../src/features/lifestyle/nutrition-engine';

const emptyNutrition = {
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

describe('nutrition engine', () => {
  test('sums catalog foods by servings', () => {
    const totals = sumMealNutrition([
      { id: '1', meal: 'breakfast', foodId: 'nasi_putih', servings: 1 },
      { id: '2', meal: 'breakfast', foodId: 'telur_rebus', servings: 2 },
    ]);
    expect(totals.calories_day1).toBe(204 + 78 * 2);
    expect(totals.protein_g_day1).toBe(Math.round((4.2 + 6.3 * 2) * 10) / 10);
    expect(totals.alcohol_g_day1).toBe(0);
  });

  test('uses food totals unless manual numbers are complete', () => {
    const meals = [{ id: '1', meal: 'lunch', foodId: 'nasi_putih', servings: 1 }];
    const fromFood = resolveDailyNutrition({
      ...emptyNutrition,
      meals,
      nutritionManual: false,
    });
    expect(fromFood.calories_day1).toBe(204);

    const manual = resolveDailyNutrition({
      ...emptyNutrition,
      calories_day1: 2200,
      protein_g_day1: 80,
      carbohydrate_g_day1: 250,
      sugar_g_day1: 60,
      total_fat_g_day1: 70,
      saturated_fat_g_day1: 20,
      sodium_mg_day1: 2000,
      fiber_g_day1: 25,
      cholesterol_mg_day1: 200,
      alcohol_g_day1: 0,
      meals,
      nutritionManual: true,
    });
    expect(manual.calories_day1).toBe(2200);
    expect(manual.sodium_mg_day1).toBe(2000);
  });

  test('is ready when foods exist or manual numbers are complete', () => {
    expect(isNutritionReady({ ...emptyNutrition, meals: [], nutritionManual: false })).toBe(false);
    expect(isNutritionReady({
      ...emptyNutrition,
      meals: [{ id: '1', meal: 'snack', foodId: 'pisang', servings: 1 }],
      nutritionManual: false,
    })).toBe(true);
  });
});
