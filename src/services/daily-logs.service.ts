import { useAuthStore } from '@/store/auth-store';
import {
  createDailyLog,
  deleteDailyLog,
  listDailyLogs,
  type CreateDailyLogInput,
} from '@/storage/daily-logs-repository';
import { localDateKey } from '@/utils/local-date';
import { dailySyncService } from './daily-sync.service';

function ownerUserId(): number {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error('Sesi pengguna tidak tersedia');
  return id;
}

function localTimeKey(date = new Date()): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function normalizeTimeInput(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return trimmed;
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

export const dailyLogsService = {
  getForDate: (date = localDateKey()) => listDailyLogs(ownerUserId(), date),

  create: async (data: Omit<CreateDailyLogInput, 'logDate' | 'time'> & {
    logDate?: string;
    time?: string;
  }) => {
    const logDate = data.logDate ?? localDateKey();
    const log = await createDailyLog(ownerUserId(), {
      ...data,
      title: data.title.trim(),
      logDate,
      time: normalizeTimeInput(data.time ?? localTimeKey()),
    });
    await dailySyncService.sync(logDate, { checkResume: false });
    return log;
  },

  delete: async (id: number) => {
    const date = localDateKey();
    const result = { deleted: await deleteDailyLog(ownerUserId(), id) };
    await dailySyncService.sync(date, { checkResume: false });
    return result;
  },
};
