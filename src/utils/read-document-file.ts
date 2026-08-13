import * as FileSystem from 'expo-file-system/legacy';
import { toAbsoluteFileUri } from '@/utils/file-uri';

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function normalizeReadError(err: unknown): Error {
  if (err instanceof Error) {
    if (/HostFunction|ExponentFileSystem|readAsStringAsync/i.test(err.message)) {
      return new Error('Gagal membaca file. Pastikan PDF/foto valid, lalu coba lagi.');
    }
    return err;
  }
  return new Error('Gagal membaca file');
}

export async function readDocumentFile(uri: string): Promise<{ bytes: Uint8Array; base64: string }> {
  const fileUri = toAbsoluteFileUri(uri);
  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    if (!info.exists) {
      throw new Error('File tidak ditemukan setelah dipilih.');
    }
    if ('size' in info && typeof info.size === 'number' && info.size === 0) {
      throw new Error('File kosong.');
    }

    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (!base64) {
      throw new Error('File tidak dapat dibaca.');
    }

    return { bytes: base64ToBytes(base64), base64 };
  } catch (err) {
    throw normalizeReadError(err);
  }
}

export function bytesFromBase64(base64: string): Uint8Array {
  return base64ToBytes(base64);
}

export function base64FromBytes(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
