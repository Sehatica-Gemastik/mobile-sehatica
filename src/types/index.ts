// ── Core Types ─────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'doctor' | 'admin';
  avatarInitials: string | null;
  isPro: boolean;
  phone?: string | null;
  dateOfBirth?: string | null;
  bloodType?: string | null;
  allergies?: string | null;
  conditions?: string | null;
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

// ── Chat ────────────────────────────────────────────────────────────────────
export type VerifStatus = 'pending' | 'approved' | 'revised';

export interface ChatMessage {
  id: number;
  userId: number;
  role: 'user' | 'assistant';
  content: string;
  needsVerif: boolean;
  verifStatus: VerifStatus | null;
  verifDoctorName: string | null;
  verifNote: string | null;
  fromWhatsApp: boolean;
  createdAt: string;
}

// ── Verif Requests ──────────────────────────────────────────────────────────
export interface VerifRequest {
  id: number;
  messageId: number | null;
  userQuestion: string;
  aiAnswer: string;
  status: VerifStatus;
  doctorNote: string | null;
  doctorName: string | null;
  userName?: string;
  userAvatar?: string;
  requestedAt: string;
  reviewedAt: string | null;
}

// ── Doctors ─────────────────────────────────────────────────────────────────
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
export interface DailyInsight {
  mainInsight: string;
  tips: Array<{ emoji: string; text: string }>;
}

export interface DashboardData {
  today: string;
  scheduleProgress: {
    done: number;
    total: number;
    percentage: number;
  };
  nextScheduleItem: ScheduleItem | null;
  todaySchedule: ScheduleItem[];
  recentRecords: MedicalRecord[];
  recentVerif: VerifRequest[];
  dailyInsight: DailyInsight;
}

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
