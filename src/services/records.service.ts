import { Share, Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import { RecordType } from '@/types';
import type { VisionParseResult } from '@/types/medical-record-standard';
import {
  applyOcrResult,
  createRecord,
  deleteRecord,
  getRecord,
  getRecordFile,
  listRecords,
  type CreateRecordInput,
} from '@/storage/records-repository';
import { buildExportText, parseStandardMedicalRecord } from '@/utils/parse-medical-record';
import { toAbsoluteFileUri } from '@/utils/file-uri';

function ownerUserId(): number {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error('Sesi pengguna tidak tersedia');
  return id;
}

export class NotMedicalDocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotMedicalDocumentError';
  }
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_PDF_BYTES = 15 * 1024 * 1024;

function maxBytesForMime(mimeType?: string): number {
  const mime = (mimeType ?? '').toLowerCase();
  return mime.includes('pdf') ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
}

function fileExtensionForMime(mime: string): string {
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  return 'jpg';
}

export const recordsService = {
  getAll: (type?: RecordType) => listRecords(ownerUserId(), type),

  getById: (id: number) => getRecord(ownerUserId(), id),

  getFile: (id: number) => getRecordFile(ownerUserId(), id),

  create: (data: CreateRecordInput) => createRecord(ownerUserId(), data),

  createImage: async (data: {
    fileData: Uint8Array;
    title?: string;
    mimeType?: string;
    cacheUri?: string;
  }) => {
    const owner = ownerUserId();
    const mimeType = data.mimeType ?? 'image/jpeg';
    const maxBytes = maxBytesForMime(mimeType);
    if (data.fileData.byteLength > maxBytes) {
      throw new Error(mimeType.includes('pdf') ? 'Ukuran PDF maksimal 15 MB' : 'Ukuran file maksimal 10 MB');
    }
    try {
      return await createRecord(owner, {
        type: 'image',
        title: data.title?.trim() || (mimeType.includes('pdf') ? 'Dokumen PDF' : 'Dokumen medis'),
        fileData: new Uint8Array(data.fileData),
        fileMime: mimeType,
        tags: ['Dokumen'],
      });
    } finally {
      if (data.cacheUri) {
        try {
          await FileSystem.deleteAsync(toAbsoluteFileUri(data.cacheUri), { idempotent: true });
        } catch { /* best-effort cache cleanup */ }
      }
    }
  },

  enrichImage: async (id: number, fileBase64: string, mimeType = 'image/jpeg') => {
    const owner = ownerUserId();
    const legacy = await api.post<VisionParseResult>(API_ENDPOINTS.aiOcr, { imageBase64: fileBase64, mimeType });
    if (legacy.isMedicalDocument === false) {
      throw new NotMedicalDocumentError(legacy.rejectionReason ?? 'Dokumen bukan rekam medis');
    }
    return applyOcrResult(owner, id, legacy);
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

  exportRecord: async (id: number) => {
    const record = await getRecord(ownerUserId(), id);
    if (!record) throw new Error('Rekam medis tidak ditemukan');

    const standard = parseStandardMedicalRecord(record.content);
    const exportText = standard
      ? buildExportText(standard, record.title)
      : [record.title, record.summary ?? '', record.content ?? ''].filter(Boolean).join('\n\n');

    const filename = `rekam-medis-${record.id}.txt`;
    const target = new File(Paths.cache, filename);
    target.write(exportText);

    if (Platform.OS === 'web') {
      await Share.share({ message: exportText, title: record.title });
      return;
    }

    await Share.share({
      title: record.title,
      message: exportText,
      url: target.uri,
    });
  },

  exportOriginalImage: async (id: number) => {
    const file = await getRecordFile(ownerUserId(), id);
    if (!file) throw new Error('File asli tidak tersedia');

    const ext = fileExtensionForMime(file.mime);
    const target = new File(Paths.cache, `rekam-medis-${id}.${ext}`);
    target.write(file.data);

    await Share.share({
      title: 'Unduh dokumen',
      url: target.uri,
    });
  },
};
