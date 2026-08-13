import { create } from 'zustand';
import { DailyCheckin, IdentityProfile, LifestyleProfile, WeeklyCheckin } from '@/features/lifestyle/types';
import { loadLifestyleProfile, saveLifestyleProfile } from '@/features/lifestyle/storage';
import { localDateKey } from '@/utils/local-date';
import { isWeeklyDue } from '@/features/lifestyle/derived';

type LifestyleStore = LifestyleProfile & {
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  saveIdentity: (identity: Omit<IdentityProfile, 'completedAt'>) => Promise<void>;
  saveWeekly: (weekly: Omit<WeeklyCheckin, 'completedAt'>) => Promise<void>;
  saveDaily: (daily: Omit<DailyCheckin, 'completedAt'>) => Promise<void>;
};

async function persist(profile: LifestyleProfile): Promise<void> {
  await saveLifestyleProfile(profile);
}

export const useLifestyleStore = create<LifestyleStore>((set, get) => ({
  identity: null,
  weekly: null,
  daily: null,
  isLoading: true,

  loadProfile: async () => {
    set({ isLoading: true });
    const profile = await loadLifestyleProfile();
    set({ ...profile, isLoading: false });
  },

  saveIdentity: async (identity) => {
    const next: LifestyleProfile = {
      identity: { ...identity, completedAt: new Date().toISOString() },
      weekly: get().weekly,
      daily: get().daily,
    };
    await persist(next);
    set(next);
  },

  saveWeekly: async (weekly) => {
    const next: LifestyleProfile = {
      identity: get().identity,
      weekly: { ...weekly, completedAt: new Date().toISOString() },
      daily: get().daily,
    };
    await persist(next);
    set(next);
  },

  saveDaily: async (daily) => {
    const next: LifestyleProfile = {
      identity: get().identity,
      weekly: get().weekly,
      daily: { ...daily, completedAt: new Date().toISOString() },
    };
    await persist(next);
    set(next);
  },
}));

export function selectIdentityCompleted(state: LifestyleStore): boolean {
  return Boolean(state.identity);
}

export function selectWeeklyDue(state: LifestyleStore): boolean {
  return isWeeklyDue(state.weekly?.completedAt);
}

export function selectDailyDoneToday(state: LifestyleStore): boolean {
  return state.daily?.date === localDateKey();
}
