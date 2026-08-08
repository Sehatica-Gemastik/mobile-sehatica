import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { Doctor } from '@/types';

export type AddPartnerResult = {
  alreadyLinked: boolean;
  doctor: Doctor;
};

export const doctorService = {
  getAll: () => api.get<Doctor[]>(API_ENDPOINTS.doctors),
  getPartners: () => api.get<Doctor[]>(API_ENDPOINTS.doctorPartners),
  getById: (id: number) => api.get<Doctor>(API_ENDPOINTS.doctorDetail(id)),
  addPartnerByCode: (code: string) =>
    api.post<AddPartnerResult>(API_ENDPOINTS.doctorPartners, { code }),
};
