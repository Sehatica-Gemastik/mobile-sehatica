import { API_ENDPOINTS } from '@/constants/api';
import { api } from './api';

export type PatientAppointment = {
  id: string;
  doctorId: number;
  doctorName: string;
  specialty: string;
  patientId: number;
  title: string;
  notes: string;
  start: string;
  end: string;
  status: string;
};

export type AppointmentInput = {
  doctorId: number;
  title: string;
  notes: string;
  start: string;
  end: string;
};

export const appointmentsService = {
  list: async (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString();
    const path = query ? `${API_ENDPOINTS.appointments}?${query}` : API_ENDPOINTS.appointments;
    return api.get<PatientAppointment[]>(path);
  },
  create: async (input: AppointmentInput) => {
    return api.post<PatientAppointment>(API_ENDPOINTS.appointments, input);
  },
  update: async (id: string, input: AppointmentInput) => {
    return api.patch<PatientAppointment>(`${API_ENDPOINTS.appointments}/${id}`, input);
  },
  remove: async (id: string) => {
    return api.delete<{ deleted: boolean }>(`${API_ENDPOINTS.appointments}/${id}`);
  },
};
