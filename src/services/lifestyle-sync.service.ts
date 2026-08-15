import { API_ENDPOINTS } from '@/constants/api';
import { DailyCheckin, WeeklyCheckin } from '@/features/lifestyle/types';
import { api } from './api';

export const lifestyleSyncService = {
  syncWeekly: async (weekly: WeeklyCheckin) => {
    return api.post<{ completedAt: string }>(API_ENDPOINTS.healthWeeklySync, {
      weight_kg: weekly.weight_kg,
      height_cm: weekly.height_cm,
      bmi: weekly.bmi,
      waist_cm: weekly.waist_cm,
      systolic_bp: weekly.systolic_bp,
      diastolic_bp: weekly.diastolic_bp,
    });
  },

  syncDailyQuestionnaire: async (daily: DailyCheckin, weekly?: WeeklyCheckin | null) => {
    return api.post<{ date: string; aiSummary: string; completedAt: string; ptmScores?: unknown }>(
      API_ENDPOINTS.healthQuestionnaireSync,
      {
        date: daily.date,
        questionnaire: daily,
        weekly: weekly
          ? {
              weight_kg: weekly.weight_kg,
              height_cm: weekly.height_cm,
              bmi: weekly.bmi,
              waist_cm: weekly.waist_cm,
              systolic_bp: weekly.systolic_bp,
              diastolic_bp: weekly.diastolic_bp,
            }
          : undefined,
      },
    );
  },
};
