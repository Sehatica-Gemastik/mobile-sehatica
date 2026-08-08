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

  // Home
  dashboard: '/home/dashboard',

  // Medical Records
  records: '/records',
  recordOcr: '/records/ocr',
  recordVoice: '/records/voice',

  // Schedules
  schedules: '/schedules',
  toggleSchedule: (id: number) => `/schedules/${id}/toggle`,
  deleteSchedule: (id: number) => `/schedules/${id}`,
  aiGenerateSchedule: '/schedules/ai-generate',

  // Heally AI
  heallyMessages: '/heally/messages',
  heallyChat: '/heally/chat',
  heallyVerifRequest: (messageId: number) => `/heally/verif-request/${messageId}`,

  // Verifications
  verifRequests: '/verif',
  verifApprove: (id: number) => `/verif/${id}/approve`,
  verifRevise: (id: number) => `/verif/${id}/revise`,

  // Doctors
  doctors: '/doctors',
  doctorPartners: '/doctors/partners',
  doctorDetail: (id: number) => `/doctors/${id}`,
} as const;
