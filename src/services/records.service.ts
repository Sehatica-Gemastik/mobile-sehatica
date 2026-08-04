import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { MedicalRecord } from '@/types';

export const recordsService = {
  getAll: (type?: string) => {
    const endpoint = type ? `${API_ENDPOINTS.records}?type=${type}` : API_ENDPOINTS.records;
    return api.get<MedicalRecord[]>(endpoint);
  },

  getById: (id: number) =>
    api.get<MedicalRecord>(`${API_ENDPOINTS.records}/${id}`),

  create: (data: {
    type: string;
    title: string;
    content?: string;
    tags?: string[];
    doctorName?: string;
    recordDate?: string;
  }) => api.post<MedicalRecord>(API_ENDPOINTS.records, data),

  ocrImage: (imageBase64: string, mimeType = 'image/jpeg') =>
    api.post<MedicalRecord>(API_ENDPOINTS.recordOcr, { imageBase64, mimeType }),

  createVoice: (data: {
    title: string;
    transcription?: string;
    durationSeconds?: number;
  }) => api.post<MedicalRecord>(API_ENDPOINTS.recordVoice, data),

  delete: (id: number) =>
    api.delete<{ deleted: boolean }>(`${API_ENDPOINTS.records}/${id}`),
};
