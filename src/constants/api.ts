// API Configuration
// Change this to your backend server address
// For Android emulator: use 10.0.2.2 instead of localhost
// For physical device: use your computer's local IP address

import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Android emulator routes localhost to 10.0.2.2
    return 'http://10.0.2.2:3000/api/v1';
  }
  return 'http://localhost:3000/api/v1';
};

export const API_BASE_URL = getBaseUrl();

export const API_ENDPOINTS = {
  // Auth
  register: '/auth/register',
  login: '/auth/login',
  refresh: '/auth/refresh',
  me: '/auth/me',
  updateProfile: '/auth/profile',

  // Transient AI processing
  aiOcr: '/ai/ocr',
  aiGenerateSchedule: '/ai/schedules/generate',
  aiChat: '/ai/chat',

  // Doctors
  doctors: '/doctors',
  doctorDetail: (id: number) => `/doctors/${id}`,
  reviews: '/reviews',
  myReviews: '/reviews/mine',
} as const;
