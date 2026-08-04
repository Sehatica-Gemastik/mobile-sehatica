import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { Doctor } from '@/types';

export const doctorService = {
  getAll: () => api.get<Doctor[]>(API_ENDPOINTS.doctors),
  getById: (id: number) => api.get<Doctor>(API_ENDPOINTS.doctorDetail(id)),
};
