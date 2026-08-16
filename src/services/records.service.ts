import { Share, Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import type { VisionParseResult } from '@/types/medical-record-standard';
import {
  applyOcrResult,
  createRecord,
  deleteRecord,
  getRecord,
  getRecordFile,
  listRecords,
  listPdfRecords,
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

const MAX_PDF_BYTES = 15 * 1024 * 1024;

export const recordsService = {
  getAll: () => listRecords(ownerUserId()),

  listPdfDocuments: () => listPdfRecords(ownerUserId()),

  getById: (id: number) => getRecord(ownerUserId(), id),

  getFile: (id: number) => getRecordFile(ownerUserId(), id),

  create: (data: CreateRecordInput) => createRecord(ownerUserId(), data),

  createDocument: async (data: {
    fileData: Uint8Array;
    title?: string;
    cacheUri?: string;
  }) => {
    const owner = ownerUserId();
    const mimeType = 'application/pdf';
    if (data.fileData.byteLength > MAX_PDF_BYTES) {
      throw new Error('Ukuran PDF maksimal 15 MB');
    }
    try {
      return await createRecord(owner, {
        type: 'image',
        title: data.title?.trim() || 'Dokumen PDF',
        fileData: new Uint8Array(data.fileData),
        fileMime: mimeType,
        tags: ['PDF', 'Dokumen'],
      });
    } finally {
      if (data.cacheUri) {
        try {
          await FileSystem.deleteAsync(toAbsoluteFileUri(data.cacheUri), { idempotent: true });
        } catch { /* best-effort */ }
      }
    }
  },

  /** Upload PDF to backend so partner doctors can see it on web */
  uploadToCloud: async (input: {
    title: string;
    fileName: string;
    fileBase64: string;
  }) => {
    return api.post<{
      id: number;
      title: string;
      fileUrl: string | null;
      fileKey: string | null;
    }>(API_ENDPOINTS.recordsUpload, {
      title: input.title,
      fileName: input.fileName,
      mimeType: 'application/pdf',
      fileBase64: input.fileBase64,
    });
  },

  enrichDocument: async (id: number, fileBase64: string) => {
    const owner = ownerUserId();
    const legacy = await api.post<VisionParseResult>(API_ENDPOINTS.aiOcr, {
      imageBase64: fileBase64,
      mimeType: 'application/pdf',
    });
    if (legacy.isMedicalDocument === false) {
      throw new NotMedicalDocumentError(legacy.rejectionReason ?? 'Dokumen bukan rekam medis');
    }
    return applyOcrResult(owner, id, legacy);
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

  exportOriginalPdf: async (id: number) => {
    const file = await getRecordFile(ownerUserId(), id);
    if (!file) throw new Error('PDF tidak tersedia');
    if (!file.mime.includes('pdf')) throw new Error('Hanya PDF yang dapat diunduh');

    const target = new File(Paths.cache, `rekam-medis-${id}.pdf`);
    target.write(file.data);

    await Share.share({
      title: 'Unduh PDF',
      url: target.uri,
    });
  },

  /** @deprecated use createDocument */
  createImage: async (data: {
    fileData: Uint8Array;
    title?: string;
    mimeType?: string;
    cacheUri?: string;
  }) => {
    if (data.mimeType && data.mimeType !== 'application/pdf') {
      throw new Error('Hanya PDF yang didukung');
    }
    return recordsService.createDocument({
      fileData: data.fileData,
      title: data.title,
      cacheUri: data.cacheUri,
    });
  },

  /** @deprecated use enrichDocument */
  enrichImage: (id: number, fileBase64: string, mimeType = 'application/pdf') => {
    if (mimeType !== 'application/pdf') throw new Error('Hanya PDF yang didukung');
    return recordsService.enrichDocument(id, fileBase64);
  },
};
