import { create } from 'zustand';
import { DailyCheckin, LifestyleProfile, WeeklyCheckin } from '@/features/lifestyle/types';
import { loadLifestyleProfile, saveLifestyleProfile } from '@/features/lifestyle/storage';
import { hydrateDailyNutrition, resolveDailyNutrition } from '@/features/lifestyle/nutrition-engine';
import { localDateKey } from '@/utils/local-date';
import { isWeeklyDue } from '@/features/lifestyle/derived';
import { lifestyleSyncService } from '@/services/lifestyle-sync.service';

type LifestyleStore = LifestyleProfile & {
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  saveWeekly: (weekly: Omit<WeeklyCheckin, 'completedAt'>) => Promise<void>;
  saveDaily: (daily: Omit<DailyCheckin, 'completedAt'>) => Promise<void>;
};

async function persist(profile: LifestyleProfile): Promise<void> {
  await saveLifestyleProfile(profile);
}

function normalizeDaily(daily: DailyCheckin): DailyCheckin {
  const hydrated = hydrateDailyNutrition(daily);
  if (hydrated.calories_day1 >= 0) return hydrated;

  const resolved = resolveDailyNutrition({
    meals: hydrated.meals ?? [],
    nutritionManual: hydrated.nutritionManual ?? false,
    calories_day1: hydrated.calories_day1,
    protein_g_day1: hydrated.protein_g_day1,
    carbohydrate_g_day1: hydrated.carbohydrate_g_day1,
    sugar_g_day1: hydrated.sugar_g_day1,
    total_fat_g_day1: hydrated.total_fat_g_day1,
    saturated_fat_g_day1: hydrated.saturated_fat_g_day1,
    sodium_mg_day1: hydrated.sodium_mg_day1,
    fiber_g_day1: hydrated.fiber_g_day1,
    cholesterol_mg_day1: hydrated.cholesterol_mg_day1,
    alcohol_g_day1: hydrated.alcohol_g_day1,
  });

  return { ...hydrated, ...resolved };
}

export const useLifestyleStore = create<LifestyleStore>((set, get) => ({
  weekly: null,
  daily: null,
  isLoading: true,

  loadProfile: async () => {
    set({ isLoading: true });
    const profile = await loadLifestyleProfile();
    const daily = profile.daily ? normalizeDaily(profile.daily) : null;
    if (daily && profile.daily && daily.calories_day1 !== profile.daily.calories_day1) {
      const fixed = { weekly: profile.weekly, daily };
      await persist(fixed);
      set({ ...fixed, isLoading: false });
      return;
    }
    set({ weekly: profile.weekly, daily, isLoading: false });
  },

  saveWeekly: async (weekly) => {
    const next: LifestyleProfile = {
      weekly: { ...weekly, completedAt: new Date().toISOString() },
      daily: get().daily,
    };
    await persist(next);
    set(next);
    void lifestyleSyncService.syncWeekly(next.weekly!).catch(() => null);
  },

  saveDaily: async (daily) => {
    const normalized = normalizeDaily({ ...daily, completedAt: new Date().toISOString() });
    const next: LifestyleProfile = {
      weekly: get().weekly,
      daily: normalized,
    };
    await persist(next);
    set(next);
    void lifestyleSyncService.syncDailyQuestionnaire(normalized, next.weekly).catch(() => null);
  },
}));

export function selectWeeklyDue(state: LifestyleStore): boolean {
  return isWeeklyDue(state.weekly?.completedAt);
}

export function selectDailyDoneToday(state: LifestyleStore): boolean {
  return state.daily?.date === localDateKey();
}
