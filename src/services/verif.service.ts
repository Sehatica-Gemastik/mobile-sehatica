import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { DashboardData, VerifRequest } from '@/types';

export const verifService = {
  getAll: () => api.get<VerifRequest[]>(API_ENDPOINTS.verifRequests),

  approve: (id: number) =>
    api.patch<VerifRequest>(API_ENDPOINTS.verifApprove(id)),

  revise: (id: number, doctorNote: string) =>
    api.patch<VerifRequest>(API_ENDPOINTS.verifRevise(id), { doctorNote }),
};

export const homeService = {
  getDashboard: () => api.get<DashboardData>(API_ENDPOINTS.dashboard),
};
