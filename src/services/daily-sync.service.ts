import { API_ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import { SCREENING_FACTOR_LABELS } from '@/features/screening/screening-rules';
import { listDailyLogs } from '@/storage/daily-logs-repository';
import { listSchedules } from '@/storage/schedules-repository';
import { getLatestScreening } from '@/storage/screening-repository';
import { ScreeningQuestionId } from '@/types';
import { localDateKey } from '@/utils/local-date';
import { api } from './api';

export type DailyLogSnapshot = {
  type: string;
  title: string;
  time: string;
  quantity?: string | null;
  detail?: string | null;
};

export type DailySyncPayload = {
  date: string;
  dailyLogCount: number;
  ptmScreeningDone: boolean;
  ptmFactors?: string[];
  dailyLogs?: DailyLogSnapshot[];
  scheduleSnapshot?: Array<{
    type: string;
    label: string;
    time: string;
    done: boolean;
    isAiGenerated?: boolean;
  }>;
};

export type DailySyncResponse = {
  date: string;
  syncedAt: string;
};

function ownerUserId(): number {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error('Sesi pengguna tidak tersedia');
  return id;
}

export async function buildDailySyncPayload(date = localDateKey()): Promise<DailySyncPayload> {
  const owner = ownerUserId();
  const [logs, screening, schedules] = await Promise.all([
    listDailyLogs(owner, date),
    getLatestScreening(owner),
    listSchedules(owner, date),
  ]);

  const screeningToday =
    screening != null && screening.completedAt.slice(0, 10) === date;

  const ptmFactors = screeningToday
    ? screening.factors.map((id) => SCREENING_FACTOR_LABELS[id as ScreeningQuestionId] ?? id)
    : [];

  return {
    date,
    dailyLogCount: logs.length,
    ptmScreeningDone: screeningToday,
    ptmFactors,
    dailyLogs: logs.map((log) => ({
      type: log.type,
      title: log.title,
      time: log.time,
      quantity: log.quantity,
      detail: log.detail,
    })),
    scheduleSnapshot: schedules.map((item) => ({
      type: item.type,
      label: item.label,
      time: item.time,
      done: item.done,
      isAiGenerated: item.isAiGenerated,
    })),
  };
}

export const dailySyncService = {
  sync: async (date = localDateKey()): Promise<DailySyncResponse> => {
    const payload = await buildDailySyncPayload(date);
    return api.post<DailySyncResponse>(API_ENDPOINTS.healthDailySync, payload);
  },

  buildPayload: buildDailySyncPayload,
};
