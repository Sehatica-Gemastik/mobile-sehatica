import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { CriticalAlert } from '@/types';

export const alertsService = {
  getAll: () => api.get<CriticalAlert[]>(API_ENDPOINTS.alerts),

  getActive: () => api.get<CriticalAlert[]>(API_ENDPOINTS.activeAlerts),

  acknowledge: (id: number) => api.patch<CriticalAlert>(API_ENDPOINTS.acknowledgeAlert(id)),
};
