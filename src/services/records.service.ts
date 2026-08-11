import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import { RecordType } from '@/types';
import { File, Paths } from 'expo-file-system';
import {
  applyOcrResult,
  createRecord,
  deleteRecord,
  getRecord,
  listRecords,
  type CreateRecordInput,
  type OcrResult,
} from '@/storage/records-repository';

function ownerUserId(): number {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error('Sesi pengguna tidak tersedia');
  return id;
}

export const recordsService = {
  getAll: (type?: RecordType) => listRecords(ownerUserId(), type),

  getById: (id: number) => getRecord(ownerUserId(), id),

  create: (data: CreateRecordInput) => createRecord(ownerUserId(), data),

  createImage: async (data: { fileUri: string; title?: string; mimeType?: string }) => {
    const owner = ownerUserId();
    const source = new File(data.fileUri);
    if (source.size > 10 * 1024 * 1024) {
      throw new Error('Ukuran gambar maksimal 10 MB');
    }
    try {
      return await createRecord(owner, {
        type: 'image',
        title: data.title?.trim() || 'Dokumen medis',
        fileData: await source.bytes(),
        fileMime: data.mimeType ?? 'image/jpeg',
        tags: ['Dokumen'],
      });
    } finally {
      if (source.uri.startsWith(Paths.cache.uri) && source.exists) {
        try { source.delete(); } catch { /* best-effort plaintext cache cleanup */ }
      }
    }
  },

  enrichImage: async (id: number, imageBase64: string, mimeType = 'image/jpeg') => {
    const owner = ownerUserId();
    const result = await api.post<OcrResult>(API_ENDPOINTS.aiOcr, { imageBase64, mimeType });
    return applyOcrResult(owner, id, result);
  },

  createVoice: (data: {
    title: string;
    transcription?: string;
    durationSeconds?: number;
  }) => {
    const detail = data.durationSeconds
      ? `Durasi: ${Math.floor(data.durationSeconds / 60)}:${String(data.durationSeconds % 60).padStart(2, '0')} menit`
      : 'Catatan suara';
    return createRecord(ownerUserId(), {
      type: 'voice',
      title: data.title,
      content: data.transcription || detail,
      summary: data.transcription || detail,
      tags: ['Rekaman', 'Suara'],
    });
  },

  delete: async (id: number) => ({ deleted: await deleteRecord(ownerUserId(), id) }),
};
