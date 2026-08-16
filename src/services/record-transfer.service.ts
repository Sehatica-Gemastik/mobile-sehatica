import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';

export type RecordTransferPayload = {
  recordId: number;
  recordTitle: string;
  fileName: string;
  byteSize: number;
  fileBase64: string;
  method?: 'bluetooth';
};

export type RecordTransferResult = {
  id: number;
  doctorId: number;
  recordTitle: string;
  status: string;
  medicalRecordId?: number | null;
  createdAt: string;
};

export const recordTransferService = {
  logTransfer: (doctorId: number, payload: RecordTransferPayload) =>
    api.post<RecordTransferResult>(API_ENDPOINTS.doctorRecordTransfer(doctorId), payload),
};
