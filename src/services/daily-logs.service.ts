import { useAuthStore } from '@/store/auth-store';
import {
  createDailyLog,
  deleteDailyLog,
  listDailyLogs,
  type CreateDailyLogInput,
} from '@/storage/daily-logs-repository';
import { localDateKey } from '@/utils/local-date';

function ownerUserId(): number {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error('Sesi pengguna tidak tersedia');
  return id;
}

function localTimeKey(date = new Date()): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export const dailyLogsService = {
  getForDate: (date = localDateKey()) => listDailyLogs(ownerUserId(), date),
  create: (data: Omit<CreateDailyLogInput, 'logDate' | 'time'> & {
    logDate?: string;
    time?: string;
  }) => createDailyLog(ownerUserId(), {
    ...data,
    logDate: data.logDate ?? localDateKey(),
    time: data.time ?? localTimeKey(),
  }),
  delete: async (id: number) => ({ deleted: await deleteDailyLog(ownerUserId(), id) }),
};
