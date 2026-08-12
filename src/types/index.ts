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
export type ScheduleVerifStatus = 'unverified' | 'verified' | 'revised';
export type ScheduleSource = 'manual' | 'heally_generated' | 'dari_konsultasi';

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
  verifStatus: ScheduleVerifStatus;
  source: ScheduleSource;
  createdAt: string;
}

<<<<<<< Updated upstream
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
=======
// ── Risk Profile / Scoring Engine / Target Kesehatan ─────────────────────────
export type RiskLevel = 'rendah' | 'sedang' | 'tinggi';
export type SmokingHabit = 'tidak' | 'kadang' | 'rutin';
export type DataSource = 'heally_checkin' | 'checkin_berkala' | 'ocr' | 'manual' | 'wa';

export interface RiskProfile {
  id: number;
  userId: number;
  tensiSistolik: number | null;
  tensiDiastolik: number | null;
  tglUkurTensiTerakhir: string | null;
  gulaDarahPuasa: number | null;
  tglUkurGulaTerakhir: string | null;
  tinggiCm: number | null;
  beratKg: string | null;
  lingkarPerutCm: number | null;
  riwayatKeluarga: { hipertensi: boolean; diabetes: boolean; jantung: boolean; stroke: boolean } | null;
  kebiasaanMerokok: SmokingHabit | null;
  frekuensiSayurBuahPerMinggu: number | null;
  frekuensiAktivitasFisikPerMinggu: number | null;
  jenisAktivitas: string | null;
  sumberData: DataSource;
  updatedAt: string;
}

export interface RiskScore {
  id: number;
  userId: number;
  level: RiskLevel;
  skorMentah: string;
  tglDihitung: string;
  versiRule: string;
}

export interface HealthTargetMetric {
  label: string;
  targetLabel: string;
  unit: string;
  currentValue: number | string | null;
}

export interface HealthTarget {
  jenisPtm: string;
  label: string;
  targets: HealthTargetMetric[];
}

// ── Critical Alerts ────────────────────────────────────────────────────────
export interface CriticalAlert {
  id: number;
  userId: number;
  jenisParameter: string;
  nilaiTrigger: string;
  thresholdTerlampaui: string;
  tgl: string;
  statusEskalasiDokter: boolean;
  channelTerkirim: string[] | null;
  acknowledgedAt: string | null;
>>>>>>> Stashed changes
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
  askId?: string | null;
  thinkingSummary?: string | null;
  thinkingDetail?: string | null;
  createdAt: string;
}

export interface HeallyAsk {
  id: string;
  userId: number;
  armId: string;
  intent: string;
  title: string;
  body: string;
  status: 'pending' | 'delivered' | 'replied' | 'expired' | 'dismissed';
  channels: string[];
  messageId: number | null;
  reward: string | null;
  deliveredAt: string | null;
  repliedAt: string | null;
  expiresAt: string | null;
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
export interface DailyInsight {
  mainInsight: string;
  tips: Array<{ text: string }>;
}

export interface DashboardData {
  today: string;
  riskScore: RiskScore | null;
  healthTarget: HealthTarget | null;
  activeAlerts: CriticalAlert[];
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
