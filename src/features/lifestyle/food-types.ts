export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FoodCategory = 'nasi' | 'lauk' | 'sayur' | 'buah' | 'minuman' | 'cemilan';

export type FoodNutrition = {
  calories: number;
  protein_g: number;
  carbohydrate_g: number;
  sugar_g: number;
  total_fat_g: number;
  saturated_fat_g: number;
  sodium_mg: number;
  fiber_g: number;
  cholesterol_mg: number;
  alcohol_g: number;
};

export type FoodItem = {
  id: string;
  name: string;
  category: FoodCategory;
  servingLabel: string;
  imageUrl: string;
  nutrition: FoodNutrition;
};

export type MealEntry = {
  id: string;
  meal: MealType;
  foodId: string;
  servings: number;
};
