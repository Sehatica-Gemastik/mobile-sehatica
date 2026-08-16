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
  const lanHost = resolveDevLanHost();
  const isLocalhostUrl = (url: string) => /\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(url);

  if (fromEnv) {
    const normalized = fromEnv.replace(/\/$/, '');

    if (Platform.OS === 'android' && isLocalhostUrl(normalized)) {
      if (process.env.EXPO_PUBLIC_ANDROID_USB === '1') {
        return normalized;
      }
      return normalized.replace(/\/\/(localhost|127\.0\.0\.1)/, '//10.0.2.2');
    }

    if (lanHost && isLocalhostUrl(normalized)) {
      return normalized.replace(/\/\/(localhost|127\.0\.0\.1)/, `//${lanHost}`);
    }

    return normalized;
  }

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
  healthWeeklySync: '/health/weekly-sync',
  healthQuestionnaireSync: '/health/questionnaire-sync',
  rdsaPendingAsks: '/rdsa/asks/pending',
  rdsaTriggerAsk: '/rdsa/asks/trigger',
  rdsaAckAsk: (askId: string) => `/rdsa/asks/${askId}/ack`,
  doctorPartners: '/doctors/partners',
  doctorDetail: (id: number) => `/doctors/${id}`,
  doctorRecordTransfer: (doctorId: number) => `/doctors/partners/${doctorId}/record-transfers`,
  doctorRevokePartner: (doctorId: number) => `/doctors/partners/${doctorId}`,
  ptmRisk: '/health/ptm-risk',
  appointments: '/appointments',
  chatMessages: (doctorId: number) => `/chat/${doctorId}/messages`,
} as const;
