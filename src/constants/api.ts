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
  // 127.0.0.1 explicit (not "localhost") — on some dev machines "localhost"
  // resolves to ::1 first and can hit an unrelated process bound to the same
  // port over IPv6, which silently 404s instead of reaching this backend.
  return 'http://127.0.0.1:3000/api/v1';
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

  // Medical Records (backend sync when used)
  records: '/records',
  recordOcr: '/records/ocr',
  recordVoice: '/records/voice',

  // Schedules (backend sync when used)
  schedules: '/schedules',
  toggleSchedule: (id: number) => `/schedules/${id}/toggle`,
  deleteSchedule: (id: number) => `/schedules/${id}`,
  aiGenerateSchedule: '/schedules/ai-generate',
  aiOcr: '/ai/ocr',

<<<<<<< Updated upstream
  // Heally AI (backend chat + RDSA)
=======
  // Risk Profile / Scoring Engine
  riskProfile: '/risk-profile',
  scoringLatest: '/scoring/latest',

  // Critical Alerts
  alerts: '/alerts',
  activeAlerts: '/alerts?active=true',
  acknowledgeAlert: (id: number) => `/alerts/${id}/acknowledge`,

  // Heally AI
>>>>>>> Stashed changes
  heallyMessages: '/heally/messages',
  heallyChat: '/heally/chat',
  heallyVerifRequest: (messageId: number) => `/heally/verif-request/${messageId}`,
  heallyPendingAsks: '/heally/asks/pending',
  heallyTriggerAsk: '/heally/asks/trigger',
  heallyAckAsk: (askId: string) => `/heally/asks/${askId}/ack`,
  heallyLlmStatus: '/heally/llm-status',
  heallyThinkingSteps: '/heally/thinking-steps',
  heallySeedArms: '/heally/arms/seed',

  // Verifications (legacy backend verif)
  verifRequests: '/verif',
  verifApprove: (id: number) => `/verif/${id}/approve`,
  verifRevise: (id: number) => `/verif/${id}/revise`,

  // Doctors & doctor review (Heally safety flow)
  doctors: '/doctors',
  doctorPartners: '/doctors/partners',
  doctorDetail: (id: number) => `/doctors/${id}`,
  reviews: '/reviews',
  myReviews: '/reviews/mine',
} as const;
