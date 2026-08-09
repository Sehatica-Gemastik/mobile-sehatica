import {
  ScreeningAnswers,
  ScreeningCheck,
  ScreeningQuestionId,
  ScreeningStatus,
} from '@/types';

export const SCREENING_INSTRUMENT_VERSION = 'ptm-factor-checklist-v1';

export type ScreeningQuestion = {
  id: ScreeningQuestionId;
  label: string;
  helper: string;
  factorWhenYes: boolean;
  missingCheck?: ScreeningCheck;
};

export const SCREENING_QUESTIONS: ScreeningQuestion[] = [
  {
    id: 'tobacco',
    label: 'Apakah Anda merokok atau menggunakan produk tembakau?',
    helper: 'Termasuk rokok dan produk tembakau lainnya.',
    factorWhenYes: true,
  },
  {
    id: 'lowFruitVegetable',
    label: 'Apakah konsumsi buah dan sayur Anda biasanya kurang dari 5 porsi per hari?',
    helper: 'Jawab berdasarkan kebiasaan sehari-hari.',
    factorWhenYes: true,
  },
  {
    id: 'lowPhysicalActivity',
    label: 'Apakah aktivitas fisik Anda biasanya kurang dari 30 menit per hari?',
    helper: 'Misalnya berjalan cepat, bersepeda, olahraga, atau aktivitas setara.',
    factorWhenYes: true,
  },
  {
    id: 'alcohol',
    label: 'Apakah Anda mengonsumsi minuman beralkohol?',
    helper: 'Jawab “Ya” jika masih mengonsumsi saat ini.',
    factorWhenYes: true,
  },
  {
    id: 'familyHistory',
    label: 'Apakah keluarga dekat memiliki riwayat penyakit tidak menular?',
    helper: 'Misalnya hipertensi, diabetes, penyakit jantung, stroke, kanker, atau penyakit paru kronis.',
    factorWhenYes: true,
  },
  {
    id: 'knownHighBloodPressure',
    label: 'Pernahkah tenaga kesehatan menyatakan tekanan darah Anda tinggi?',
    helper: 'Pilih “Tidak tahu” bila belum pernah diperiksa atau tidak ingat.',
    factorWhenYes: true,
    missingCheck: 'blood_pressure',
  },
  {
    id: 'knownHighBloodGlucose',
    label: 'Pernahkah tenaga kesehatan menyatakan gula darah Anda tinggi?',
    helper: 'Pilih “Tidak tahu” bila belum pernah diperiksa atau tidak ingat.',
    factorWhenYes: true,
    missingCheck: 'blood_glucose',
  },
  {
    id: 'knownHighCholesterol',
    label: 'Pernahkah tenaga kesehatan menyatakan kolesterol Anda tinggi?',
    helper: 'Pilih “Tidak tahu” bila belum pernah diperiksa atau tidak ingat.',
    factorWhenYes: true,
    missingCheck: 'cholesterol',
  },
  {
    id: 'knownOverweight',
    label: 'Pernahkah tenaga kesehatan menyatakan berat badan Anda berlebih?',
    helper: 'Pilih “Tidak tahu” bila belum pernah dinilai atau tidak ingat.',
    factorWhenYes: true,
    missingCheck: 'weight_status',
  },
];

export const SCREENING_FACTOR_LABELS: Record<ScreeningQuestionId, string> = {
  tobacco: 'Penggunaan tembakau',
  lowFruitVegetable: 'Konsumsi buah dan sayur rendah',
  lowPhysicalActivity: 'Aktivitas fisik rendah',
  alcohol: 'Konsumsi alkohol',
  familyHistory: 'Riwayat PTM dalam keluarga',
  knownHighBloodPressure: 'Pernah dinyatakan tekanan darah tinggi',
  knownHighBloodGlucose: 'Pernah dinyatakan gula darah tinggi',
  knownHighCholesterol: 'Pernah dinyatakan kolesterol tinggi',
  knownOverweight: 'Pernah dinyatakan berat badan berlebih',
};

export const SCREENING_CHECK_LABELS: Record<ScreeningCheck, string> = {
  blood_pressure: 'Tekanan darah',
  blood_glucose: 'Gula darah',
  cholesterol: 'Kolesterol',
  weight_status: 'Status berat badan',
};

export function evaluateScreening(answers: ScreeningAnswers): {
  factors: ScreeningQuestionId[];
  missingChecks: ScreeningCheck[];
  status: ScreeningStatus;
} {
  const factors = SCREENING_QUESTIONS
    .filter((question) => question.factorWhenYes && answers[question.id] === 'yes')
    .map((question) => question.id);
  const missingChecks = SCREENING_QUESTIONS
    .filter((question) => question.missingCheck && answers[question.id] === 'unknown')
    .map((question) => question.missingCheck as ScreeningCheck);

  return {
    factors,
    missingChecks,
    status: factors.length > 0 ? 'factors_found' : 'no_factors_reported',
  };
}
