import { Platform } from 'react-native';
import Constants from 'expo-constants';

export function isWebPlatform(): boolean {
  return Platform.OS === 'web';
}

export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/** Rekam medis lokal butuh expo-sqlite (bukan web). */
export function canUseLocalMedicalStorage(): boolean {
  return !isWebPlatform();
}

export function medicalStorageBlockedReason(): string | null {
  if (isWebPlatform()) {
    return 'Upload dokumen rekam medis tidak tersedia di browser. Gunakan development build Android/iOS.';
  }
  return null;
}
