import type { IconName } from '@/components/ui/icon';

export type ChoiceOption = {
  value: number;
  label: string;
  hint?: string;
  icon?: IconName;
  iconColor?: string;
  iconBg?: string;
};

export const SEX_OPTIONS: ChoiceOption[] = [
  { value: 1, label: 'Laki-laki', icon: 'male-outline', iconColor: '#0284C7', iconBg: '#E0F2FE' },
  { value: 2, label: 'Perempuan', icon: 'female-outline', iconColor: '#DB2777', iconBg: '#FCE7F3' },
];

export const RACE_OPTIONS: ChoiceOption[] = [
  { value: 1, label: 'Hispanik / Latino (Meksiko)', icon: 'earth-outline', iconColor: '#EA580C', iconBg: '#FFEDD5' },
  { value: 2, label: 'Hispanik / Latino (lainnya)', icon: 'globe-outline', iconColor: '#CA8A04', iconBg: '#FEF9C3' },
  { value: 3, label: 'Kulit putih', icon: 'person-outline', iconColor: '#64748B', iconBg: '#F1F5F9' },
  { value: 4, label: 'Kulit hitam / Afrika', icon: 'people-outline', iconColor: '#7C3AED', iconBg: '#EDE9FE' },
  { value: 6, label: 'Asia', icon: 'leaf-outline', iconColor: '#059669', iconBg: '#D1FAE5' },
  { value: 7, label: 'Lainnya / campuran', icon: 'sparkles-outline', iconColor: '#0D9488', iconBg: '#CCFBF1' },
];

export const EDUCATION_OPTIONS: ChoiceOption[] = [
  { value: 1, label: 'Tidak tamat SD', icon: 'book-outline', iconColor: '#DC2626', iconBg: '#FEE2E2' },
  { value: 2, label: 'SMP / sederajat', icon: 'school-outline', iconColor: '#D97706', iconBg: '#FFEDD5' },
  { value: 3, label: 'SMA / sederajat', icon: 'library-outline', iconColor: '#2563EB', iconBg: '#DBEAFE' },
  { value: 4, label: 'Diploma / kuliah sebagian', icon: 'reader-outline', iconColor: '#7C3AED', iconBg: '#EDE9FE' },
  { value: 5, label: 'Sarjana atau lebih', icon: 'ribbon-outline', iconColor: '#0D9488', iconBg: '#CCFBF1' },
];

export const INCOME_OPTIONS: ChoiceOption[] = [
  { value: 0.5, label: 'Sangat rendah', hint: 'Jauh di bawah kebutuhan sehari-hari', icon: 'trending-down-outline', iconColor: '#DC2626', iconBg: '#FEE2E2' },
  { value: 1, label: 'Rendah', hint: 'Sekitar garis kebutuhan dasar', icon: 'wallet-outline', iconColor: '#EA580C', iconBg: '#FFEDD5' },
  { value: 2, label: 'Cukup', hint: 'Kebutuhan dasar terpenuhi', icon: 'cash-outline', iconColor: '#CA8A04', iconBg: '#FEF9C3' },
  { value: 3, label: 'Menengah', hint: 'Ada ruang untuk kebutuhan lain', icon: 'card-outline', iconColor: '#2563EB', iconBg: '#DBEAFE' },
  { value: 4, label: 'Di atas rata-rata', icon: 'trending-up-outline', iconColor: '#059669', iconBg: '#D1FAE5' },
  { value: 5, label: 'Tinggi', icon: 'diamond-outline', iconColor: '#0D9488', iconBg: '#CCFBF1' },
];

export const YES_NO_OPTIONS: ChoiceOption[] = [
  { value: 1, label: 'Ya', icon: 'checkmark-circle-outline', iconColor: '#059669', iconBg: '#D1FAE5' },
  { value: 0, label: 'Tidak', icon: 'close-circle-outline', iconColor: '#64748B', iconBg: '#F1F5F9' },
];

export const ALCOHOL_FREQUENCY_OPTIONS: ChoiceOption[] = [
  { value: 1, label: 'Setiap hari', icon: 'calendar-outline', iconColor: '#DC2626', iconBg: '#FEE2E2' },
  { value: 3, label: '3-4 kali seminggu', icon: 'beer-outline', iconColor: '#EA580C', iconBg: '#FFEDD5' },
  { value: 4, label: '2 kali seminggu', icon: 'wine-outline', iconColor: '#D97706', iconBg: '#FEF3C7' },
  { value: 5, label: 'Seminggu sekali', icon: 'time-outline', iconColor: '#2563EB', iconBg: '#DBEAFE' },
  { value: 6, label: '2-3 kali sebulan', icon: 'calendar-number-outline', iconColor: '#7C3AED', iconBg: '#EDE9FE' },
  { value: 7, label: 'Sebulan sekali', icon: 'moon-outline', iconColor: '#64748B', iconBg: '#F1F5F9' },
  { value: 10, label: 'Jarang / 1-2 kali setahun', icon: 'leaf-outline', iconColor: '#059669', iconBg: '#D1FAE5' },
  { value: 0, label: 'Tidak dalam setahun terakhir', icon: 'ban-outline', iconColor: '#0D9488', iconBg: '#CCFBF1' },
];

export const BINGE_FREQUENCY_OPTIONS: ChoiceOption[] = [
  { value: 0, label: 'Tidak pernah', icon: 'shield-checkmark-outline', iconColor: '#059669', iconBg: '#D1FAE5' },
  { value: 7, label: 'Sebulan sekali atau kurang', icon: 'calendar-outline', iconColor: '#2563EB', iconBg: '#DBEAFE' },
  { value: 5, label: 'Seminggu sekali', icon: 'alert-circle-outline', iconColor: '#D97706', iconBg: '#FEF3C7' },
  { value: 3, label: 'Beberapa kali seminggu', icon: 'warning-outline', iconColor: '#EA580C', iconBg: '#FFEDD5' },
  { value: 1, label: 'Hampir setiap hari', icon: 'flame-outline', iconColor: '#DC2626', iconBg: '#FEE2E2' },
];

export const DAY_CHIPS = [1, 2, 3, 4, 5, 6, 7];
export const MINUTE_CHIPS = [10, 15, 20, 30, 45, 60, 90];
export const HOUR_CHIPS = [2, 4, 6, 8, 10, 12];

export type NutritionFieldKey =
  | 'calories_day1'
  | 'protein_g_day1'
  | 'carbohydrate_g_day1'
  | 'sugar_g_day1'
  | 'total_fat_g_day1'
  | 'saturated_fat_g_day1'
  | 'sodium_mg_day1'
  | 'fiber_g_day1'
  | 'cholesterol_mg_day1'
  | 'alcohol_g_day1';

export const NUTRITION_FIELDS: {
  key: NutritionFieldKey;
  label: string;
  unit: string;
  max: number;
}[] = [
  { key: 'calories_day1', label: 'Kalori', unit: 'kcal', max: 8000 },
  { key: 'protein_g_day1', label: 'Protein', unit: 'g', max: 400 },
  { key: 'carbohydrate_g_day1', label: 'Karbohidrat', unit: 'g', max: 800 },
  { key: 'sugar_g_day1', label: 'Gula', unit: 'g', max: 400 },
  { key: 'total_fat_g_day1', label: 'Lemak total', unit: 'g', max: 300 },
  { key: 'saturated_fat_g_day1', label: 'Lemak jenuh', unit: 'g', max: 150 },
  { key: 'sodium_mg_day1', label: 'Natrium', unit: 'mg', max: 10000 },
  { key: 'fiber_g_day1', label: 'Serat', unit: 'g', max: 80 },
  { key: 'cholesterol_mg_day1', label: 'Kolesterol', unit: 'mg', max: 1000 },
  { key: 'alcohol_g_day1', label: 'Alkohol', unit: 'g', max: 200 },
];
