import { Platform } from 'react-native';
import Constants from 'expo-constants';

function resolveDevLanHost(): string | null {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost
    ?? (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost
    ?? Constants.expoConfig?.hostUri?.replace(/^exp:\/\//, '').split('/')[0];

  if (!debuggerHost) return null;
  const host = debuggerHost.split(':')[0];
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  return host;
}

const getBaseUrl = () => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const lanHost = resolveDevLanHost();
  if (lanHost) {
    return `http://${lanHost}:3000/api/v1`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api/v1';
  }

  return 'http://localhost:3000/api/v1';
};

export const API_BASE_URL = getBaseUrl();

export const API_ENDPOINTS = {
  register: '/auth/register',
  login: '/auth/login',
  refresh: '/auth/refresh',
  me: '/auth/me',
  updateProfile: '/auth/profile',
  dashboard: '/home/dashboard',
  records: '/records',
  recordOcr: '/records/ocr',
  recordVoice: '/records/voice',
  schedules: '/schedules',
  toggleSchedule: (id: number) => `/schedules/${id}/toggle`,
  deleteSchedule: (id: number) => `/schedules/${id}`,
  aiGenerateSchedule: '/schedules/ai-generate',
  aiOcr: '/ai/ocr',
  aiMedicalVision: '/ai/medical-vision',
  healthDailySync: '/health/daily-sync',
  heallyMessages: '/heally/messages',
  heallyChat: '/heally/chat',
  heallyVerifRequest: (messageId: number) => `/heally/verif-request/${messageId}`,
  heallyPendingAsks: '/heally/asks/pending',
  heallyTriggerAsk: '/heally/asks/trigger',
  heallyAckAsk: (askId: string) => `/heally/asks/${askId}/ack`,
  heallyLlmStatus: '/heally/llm-status',
  heallyThinkingSteps: '/heally/thinking-steps',
  heallySeedArms: '/heally/arms/seed',
  verifRequests: '/verif',
  verifApprove: (id: number) => `/verif/${id}/approve`,
  verifRevise: (id: number) => `/verif/${id}/revise`,
  doctors: '/doctors',
  doctorPartners: '/doctors/partners',
  doctorDetail: (id: number) => `/doctors/${id}`,
  reviews: '/reviews',
  myReviews: '/reviews/mine',
} as const;
