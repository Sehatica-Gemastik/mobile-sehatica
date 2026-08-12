import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { LifestyleProfile } from './types';

const STORAGE_KEY = 'sehatica_lifestyle_profile';
const FILE_NAME = 'lifestyle-profile.json';

const EMPTY_PROFILE: LifestyleProfile = {
  identity: null,
  weekly: null,
  daily: null,
};

function fileUri(): string {
  return `${FileSystem.documentDirectory ?? ''}${FILE_NAME}`;
}

export async function loadLifestyleProfile(): Promise<LifestyleProfile> {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return EMPTY_PROFILE;
      return { ...EMPTY_PROFILE, ...JSON.parse(raw) } as LifestyleProfile;
    }

    const uri = fileUri();
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return EMPTY_PROFILE;
    const raw = await FileSystem.readAsStringAsync(uri);
    return { ...EMPTY_PROFILE, ...JSON.parse(raw) } as LifestyleProfile;
  } catch (err) {
    console.error('Failed to load lifestyle profile:', err);
    return EMPTY_PROFILE;
  }
}

export async function saveLifestyleProfile(profile: LifestyleProfile): Promise<void> {
  const payload = JSON.stringify(profile);
  if (Platform.OS === 'web') {
    localStorage.setItem(STORAGE_KEY, payload);
    return;
  }
  await FileSystem.writeAsStringAsync(fileUri(), payload);
}
