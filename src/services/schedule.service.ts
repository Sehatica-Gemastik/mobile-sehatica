import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { ScheduleItem } from '@/types';

export const scheduleService = {
  getForDate: (date?: string) => {
    const today = date ?? new Date().toISOString().split('T')[0];
    return api.get<ScheduleItem[]>(`${API_ENDPOINTS.schedules}?date=${today}`);
  },

  create: (data: {
    type: string;
    label: string;
    detail?: string;
    time: string;
    scheduleDate?: string;
    colorScheme?: string;
  }) => api.post<ScheduleItem>(API_ENDPOINTS.schedules, data),

  toggle: (id: number) =>
    api.patch<ScheduleItem>(API_ENDPOINTS.toggleSchedule(id)),

  delete: (id: number) =>
    api.delete<{ deleted: boolean }>(API_ENDPOINTS.deleteSchedule(id)),

  aiGenerate: () =>
    api.post<ScheduleItem[]>(API_ENDPOINTS.aiGenerateSchedule, {}),
};
