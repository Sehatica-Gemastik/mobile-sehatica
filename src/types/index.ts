// ── Core Types ─────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'doctor' | 'admin';
  avatarInitials: string | null;
  isPro: boolean;
  phone?: string | null;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

// ── Medical Records ─────────────────────────────────────────────────────────
export type RecordType = 'consultation' | 'image' | 'voice' | 'note';

export interface MedicalRecord {
  id: number;
  userId: number;
  type: RecordType;
  title: string;
  content: string | null;
  summary: string | null;
  fileUrl: string | null;
  fileMime?: string | null;
  tags: string[] | null;
  doctorName: string | null;
  recordDate: string | null;
  isAiSummarized: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Schedules ───────────────────────────────────────────────────────────────
export type ScheduleType = 'food' | 'pill' | 'exercise' | 'water' | 'other';

export interface ScheduleItem {
  id: number;
  userId: number;
  type: ScheduleType;
  label: string;
  detail: string | null;
  time: string;
  done: boolean;
  scheduleDate: string;
  isAiGenerated: boolean;
  colorScheme: string | null;
  createdAt: string;
}

// ── Daily Logs ──────────────────────────────────────────────────────────────
export type DailyLogType = 'food' | 'medication' | 'exercise' | 'water';

export interface DailyLog {
  id: number;
  userId: number;
  type: DailyLogType;
  title: string;
  quantity: string | null;
  detail: string | null;
  logDate: string;
  time: string;
  source: 'manual' | 'schedule' | 'heally';
  createdAt: string;
}

// Screening PTM
export type ScreeningAnswer = 'yes' | 'no' | 'unknown';
export type ScreeningQuestionId =
  | 'tobacco'
  | 'lowFruitVegetable'
  | 'lowPhysicalActivity'
  | 'alcohol'
  | 'familyHistory'
  | 'knownHighBloodPressure'
  | 'knownHighBloodGlucose'
  | 'knownHighCholesterol'
  | 'knownOverweight';

export type ScreeningAnswers = Record<ScreeningQuestionId, ScreeningAnswer>;
export type ScreeningCheck = 'blood_pressure' | 'blood_glucose' | 'cholesterol' | 'weight_status';
export type ScreeningStatus = 'no_factors_reported' | 'factors_found';

export interface ScreeningSession {
  id: number;
  userId: number;
  instrumentVersion: string;
  answers: ScreeningAnswers;
  factors: ScreeningQuestionId[];
  missingChecks: ScreeningCheck[];
  status: ScreeningStatus;
  completedAt: string;
}

// ── Chat ────────────────────────────────────────────────────────────────────
export type VerifStatus = 'pending' | 'approved' | 'revised';
export type ChatSafetyLevel = 'general' | 'review' | 'urgent';

export interface ChatMessage {
  id: number;
  userId: number;
  role: 'user' | 'assistant';
  content: string;
  needsVerif: boolean;
  safetyLevel: ChatSafetyLevel;
  safetyReasons: string[];
  verifStatus: VerifStatus | null;
  verifDoctorName: string | null;
  verifNote: string | null;
  fromWhatsApp: boolean;
  createdAt: string;
}

// ── Verif Requests ──────────────────────────────────────────────────────────
// ── Doctors ─────────────────────────────────────────────────────────────────
export interface ReviewSummary {
  id: number;
  clientMessageId: number;
  status: VerifStatus;
  doctorName: string;
  doctorNote: string | null;
  expiresAt: string;
  decidedAt: string | null;
}

export interface Doctor {
  id: number;
  name: string;
  email?: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  verifiedCount: number;
  isAvailable: boolean;
  bio: string | null;
  avatarInitials: string;
  colorScheme?: string;
  isYours?: boolean;
}

// ── Dashboard ───────────────────────────────────────────────────────────────
// ── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
