export type ChoiceOption = {
  value: number;
  label: string;
  hint?: string;
};

export const SEX_OPTIONS: ChoiceOption[] = [
  { value: 1, label: 'Laki-laki' },
  { value: 2, label: 'Perempuan' },
];

export const RACE_OPTIONS: ChoiceOption[] = [
  { value: 1, label: 'Hispanik / Latino (Meksiko)' },
  { value: 2, label: 'Hispanik / Latino (lainnya)' },
  { value: 3, label: 'Kulit putih' },
  { value: 4, label: 'Kulit hitam / Afrika' },
  { value: 6, label: 'Asia' },
  { value: 7, label: 'Lainnya / campuran' },
];

export const EDUCATION_OPTIONS: ChoiceOption[] = [
  { value: 1, label: 'Tidak tamat SD' },
  { value: 2, label: 'SMP / sederajat' },
  { value: 3, label: 'SMA / sederajat' },
  { value: 4, label: 'Diploma / kuliah sebagian' },
  { value: 5, label: 'Sarjana atau lebih' },
];

export const INCOME_OPTIONS: ChoiceOption[] = [
  { value: 0.5, label: 'Sangat rendah', hint: 'Jauh di bawah kebutuhan sehari-hari' },
  { value: 1, label: 'Rendah', hint: 'Sekitar garis kebutuhan dasar' },
  { value: 2, label: 'Cukup', hint: 'Kebutuhan dasar terpenuhi' },
  { value: 3, label: 'Menengah', hint: 'Ada ruang untuk kebutuhan lain' },
  { value: 4, label: 'Di atas rata-rata' },
  { value: 5, label: 'Tinggi' },
];

export const YES_NO_OPTIONS: ChoiceOption[] = [
  { value: 1, label: 'Ya' },
  { value: 0, label: 'Tidak' },
];

export const ALCOHOL_FREQUENCY_OPTIONS: ChoiceOption[] = [
  { value: 1, label: 'Setiap hari' },
  { value: 3, label: '3-4 kali seminggu' },
  { value: 4, label: '2 kali seminggu' },
  { value: 5, label: 'Seminggu sekali' },
  { value: 6, label: '2-3 kali sebulan' },
  { value: 7, label: 'Sebulan sekali' },
  { value: 10, label: 'Jarang / 1-2 kali setahun' },
  { value: 0, label: 'Tidak dalam setahun terakhir' },
];

export const BINGE_FREQUENCY_OPTIONS: ChoiceOption[] = [
  { value: 0, label: 'Tidak pernah' },
  { value: 7, label: 'Sebulan sekali atau kurang' },
  { value: 5, label: 'Seminggu sekali' },
  { value: 3, label: 'Beberapa kali seminggu' },
  { value: 1, label: 'Hampir setiap hari' },
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
