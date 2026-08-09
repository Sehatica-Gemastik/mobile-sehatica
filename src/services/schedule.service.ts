import { API_ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import { listRecords } from '@/storage/records-repository';
import {
  createSchedule,
  deleteSchedule,
  listSchedules,
  replaceAiSchedules,
  toggleSchedule,
  type CreateScheduleInput,
} from '@/storage/schedules-repository';
import { ScheduleType } from '@/types';
import { localDateKey } from '@/utils/local-date';
import { api } from './api';

type GeneratedItem = {
  type: Exclude<ScheduleType, 'pill' | 'other'>;
  label: string;
  detail: string | null;
  time: string;
  colorScheme?: string | null;
};

type GeneratedResponse = {
  items: GeneratedItem[];
  warnings: string[];
};

function ownerUserId(): number {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error('Sesi pengguna tidak tersedia');
  return id;
}

export const scheduleService = {
  getForDate: (date = localDateKey()) => listSchedules(ownerUserId(), date),

  create: (data: Omit<CreateScheduleInput, 'scheduleDate'> & { scheduleDate?: string }) =>
    createSchedule(ownerUserId(), { ...data, scheduleDate: data.scheduleDate ?? localDateKey() }),

  toggle: (id: number) => toggleSchedule(ownerUserId(), id),

  delete: async (id: number) => ({ deleted: await deleteSchedule(ownerUserId(), id) }),

  aiGenerate: async (date = localDateKey()) => {
    const owner = ownerUserId();
    const [records, schedules] = await Promise.all([
      listRecords(owner),
      listSchedules(owner, date),
    ]);
    const healthContext = records.slice(0, 5).map((record) =>
      `${record.title}: ${record.summary ?? record.content ?? 'Tanpa detail'}`
    ).join('\n').slice(0, 6_000);
    const explicitMedicationInstructions = schedules
      .filter((item) => item.type === 'pill' && !item.isAiGenerated)
      .map(({ label, detail, time }) => ({ label, detail, time }));

    const generated = await api.post<GeneratedResponse>(API_ENDPOINTS.aiGenerateSchedule, {
      date,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      healthContext,
      explicitMedicationInstructions,
    });
    if (
      !generated ||
      !Array.isArray(generated.items) ||
      !Array.isArray(generated.warnings) ||
      generated.items.some((item) => !item || !['food', 'exercise', 'water'].includes(item.type))
    ) {
      throw new Error('Respons jadwal AI tidak valid');
    }
    const items = await replaceAiSchedules(owner, date, generated.items);
    return {
      items,
      warnings: generated.warnings.filter((warning): warning is string => typeof warning === 'string'),
    };
  },
};
