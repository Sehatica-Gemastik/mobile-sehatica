import { FoodCategory, FoodItem, FoodNutrition, MealType } from './food-types';

function n(
  calories: number,
  protein_g: number,
  carbohydrate_g: number,
  sugar_g: number,
  total_fat_g: number,
  saturated_fat_g: number,
  sodium_mg: number,
  fiber_g: number,
  cholesterol_mg: number,
  alcohol_g = 0,
): FoodNutrition {
  return {
    calories, protein_g, carbohydrate_g, sugar_g, total_fat_g,
    saturated_fat_g, sodium_mg, fiber_g, cholesterol_mg, alcohol_g,
  };
}

function img(id: string): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&h=400&q=60`;
}

export const MEAL_OPTIONS: { id: MealType; label: string }[] = [
  { id: 'breakfast', label: 'Sarapan' },
  { id: 'lunch', label: 'Makan siang' },
  { id: 'dinner', label: 'Makan malam' },
  { id: 'snack', label: 'Cemilan' },
];

export const FOOD_CATEGORIES: { id: FoodCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'nasi', label: 'Nasi' },
  { id: 'lauk', label: 'Lauk' },
  { id: 'sayur', label: 'Sayur' },
  { id: 'buah', label: 'Buah' },
  { id: 'minuman', label: 'Minuman' },
  { id: 'cemilan', label: 'Cemilan' },
];

export const FOOD_CATALOG: FoodItem[] = [
  { id: 'nasi_putih', name: 'Nasi putih', category: 'nasi', servingLabel: '1 porsi (150 g)', imageUrl: img('photo-1516684738272-bd1345d6b8d2'), nutrition: n(204, 4.2, 44, 0.1, 0.4, 0.1, 2, 0.6, 0) },
  { id: 'nasi_merah', name: 'Nasi merah', category: 'nasi', servingLabel: '1 porsi (150 g)', imageUrl: img('photo-1536304993881-ff5e17fcf2c9'), nutrition: n(166, 3.5, 35, 0.4, 1.2, 0.3, 4, 1.8, 0) },
  { id: 'nasi_goreng', name: 'Nasi goreng', category: 'nasi', servingLabel: '1 porsi', imageUrl: img('photo-1603133872878-684f208fb84b'), nutrition: n(350, 8, 45, 3, 14, 4, 700, 1.5, 80) },
  { id: 'nasi_uduk', name: 'Nasi uduk', category: 'nasi', servingLabel: '1 porsi', imageUrl: img('photo-1596560548464-f010549b84d7'), nutrition: n(280, 5, 40, 1, 10, 6, 400, 0.8, 0) },
  { id: 'nasi_kuning', name: 'Nasi kuning', category: 'nasi', servingLabel: '1 porsi', imageUrl: img('photo-1512058564366-18510be2db19'), nutrition: n(260, 5, 42, 1, 8, 3, 450, 0.8, 0) },
  { id: 'lontong', name: 'Lontong', category: 'nasi', servingLabel: '1 potong', imageUrl: img('photo-1626074353765-517a681e40be'), nutrition: n(190, 4, 42, 0, 0.5, 0.1, 5, 0.6, 0) },

  { id: 'ayam_goreng', name: 'Ayam goreng', category: 'lauk', servingLabel: '1 potong', imageUrl: img('photo-1598103442097-8b74394b95c6'), nutrition: n(280, 25, 8, 0, 16, 4, 450, 0, 85) },
  { id: 'ayam_bakar', name: 'Ayam bakar', category: 'lauk', servingLabel: '1 potong', imageUrl: img('photo-1527477396000-e27163b481c2'), nutrition: n(220, 28, 4, 2, 10, 2.5, 380, 0, 75) },
  { id: 'telur_dadar', name: 'Telur dadar', category: 'lauk', servingLabel: '1 butir', imageUrl: img('photo-1525351484163-7529414344d8'), nutrition: n(180, 12, 2, 1, 14, 4, 220, 0, 370) },
  { id: 'telur_rebus', name: 'Telur rebus', category: 'lauk', servingLabel: '1 butir', imageUrl: img('photo-1582722872445-44dc5f7e3c8f'), nutrition: n(78, 6.3, 0.6, 0.6, 5.3, 1.6, 62, 0, 186) },
  { id: 'ikan_goreng', name: 'Ikan goreng', category: 'lauk', servingLabel: '1 potong', imageUrl: img('photo-1519708227418-c8fd9a32b7a2'), nutrition: n(240, 22, 6, 0, 14, 3, 320, 0, 70) },
  { id: 'ikan_bakar', name: 'Ikan bakar', category: 'lauk', servingLabel: '1 potong', imageUrl: img('photo-1559339352-11d035aa65de'), nutrition: n(180, 24, 2, 1, 8, 2, 280, 0, 60) },
  { id: 'tempe_goreng', name: 'Tempe goreng', category: 'lauk', servingLabel: '2 potong', imageUrl: img('photo-1593001874117-c99c800e3eb7'), nutrition: n(190, 12, 10, 0.5, 12, 3, 250, 3, 0) },
  { id: 'tahu_goreng', name: 'Tahu goreng', category: 'lauk', servingLabel: '2 potong', imageUrl: img('photo-1546069901-ba9599a7e63c'), nutrition: n(140, 8, 6, 0.5, 10, 2, 180, 1.2, 0) },
  { id: 'rendang', name: 'Rendang', category: 'lauk', servingLabel: '1 porsi', imageUrl: img('photo-1604908176997-125f25cc6f3d'), nutrition: n(320, 22, 8, 3, 22, 12, 520, 1, 70) },
  { id: 'bakso', name: 'Bakso', category: 'lauk', servingLabel: '1 mangkuk', imageUrl: img('photo-1529042410759-befb1204b468'), nutrition: n(210, 14, 16, 2, 9, 3.5, 680, 0.8, 45) },

  { id: 'sayur_asem', name: 'Sayur asem', category: 'sayur', servingLabel: '1 mangkuk', imageUrl: img('photo-1540420773420-3366772f4999'), nutrition: n(90, 3, 16, 4, 2, 0.4, 400, 3, 0) },
  { id: 'capcay', name: 'Capcay', category: 'sayur', servingLabel: '1 porsi', imageUrl: img('photo-1512621776951-a57141f2eefd'), nutrition: n(110, 4, 12, 4, 5, 1, 450, 3.5, 0) },
  { id: 'kangkung', name: 'Tumis kangkung', category: 'sayur', servingLabel: '1 porsi', imageUrl: img('photo-1576045057995-568f588f82fb'), nutrition: n(80, 3, 8, 2, 4, 0.8, 380, 2.5, 0) },
  { id: 'bayam', name: 'Tumis bayam', category: 'sayur', servingLabel: '1 porsi', imageUrl: img('photo-1576045057995-568f588f82fb'), nutrition: n(70, 3, 6, 1, 4, 0.7, 320, 2.2, 0) },
  { id: 'lalapan', name: 'Lalapan', category: 'sayur', servingLabel: '1 porsi', imageUrl: img('photo-1610348725531-843dff563e2c'), nutrition: n(35, 2, 6, 3, 0.3, 0, 20, 2, 0) },
  { id: 'gado_gado', name: 'Gado-gado', category: 'sayur', servingLabel: '1 porsi', imageUrl: img('photo-1626074353765-517a681e40be'), nutrition: n(280, 10, 22, 8, 16, 5, 500, 5, 40) },

  { id: 'pisang', name: 'Pisang', category: 'buah', servingLabel: '1 buah', imageUrl: img('photo-1571771894821-ce9b6c11b08e'), nutrition: n(105, 1.3, 27, 14, 0.4, 0.1, 1, 3.1, 0) },
  { id: 'apel', name: 'Apel', category: 'buah', servingLabel: '1 buah', imageUrl: img('photo-1560806887-1e4cd0b6cbd6'), nutrition: n(95, 0.5, 25, 19, 0.3, 0, 2, 4.4, 0) },
  { id: 'jeruk', name: 'Jeruk', category: 'buah', servingLabel: '1 buah', imageUrl: img('photo-1547514701-4278210176e7'), nutrition: n(62, 1.2, 15, 12, 0.2, 0, 0, 3.1, 0) },
  { id: 'pepaya', name: 'Pepaya', category: 'buah', servingLabel: '1 potong', imageUrl: img('photo-1517282009859-f000ec3b26fe'), nutrition: n(55, 0.9, 14, 8, 0.2, 0, 3, 2.5, 0) },
  { id: 'semangka', name: 'Semangka', category: 'buah', servingLabel: '1 potong', imageUrl: img('photo-1587049352846-4a222e784d38'), nutrition: n(46, 0.9, 12, 9, 0.2, 0, 2, 0.6, 0) },

  { id: 'teh_manis', name: 'Teh manis', category: 'minuman', servingLabel: '1 gelas', imageUrl: img('photo-1556679343-c7306c1976bc'), nutrition: n(90, 0, 22, 22, 0, 0, 5, 0, 0) },
  { id: 'es_teh', name: 'Es teh', category: 'minuman', servingLabel: '1 gelas', imageUrl: img('photo-1556679343-c7306c1976bc'), nutrition: n(120, 0, 30, 30, 0, 0, 8, 0, 0) },
  { id: 'kopi_hitam', name: 'Kopi hitam', category: 'minuman', servingLabel: '1 cangkir', imageUrl: img('photo-1495474472287-4d71bcdd2085'), nutrition: n(5, 0.3, 0, 0, 0, 0, 5, 0, 0) },
  { id: 'susu', name: 'Susu', category: 'minuman', servingLabel: '1 gelas', imageUrl: img('photo-1550583724-b2692b85b150'), nutrition: n(150, 8, 12, 12, 8, 5, 105, 0, 24) },
  { id: 'jus_jeruk', name: 'Jus jeruk', category: 'minuman', servingLabel: '1 gelas', imageUrl: img('photo-1600271886742-f049cd451bba'), nutrition: n(110, 2, 26, 21, 0.3, 0, 2, 0.5, 0) },
  { id: 'air_putih', name: 'Air putih', category: 'minuman', servingLabel: '1 gelas', imageUrl: img('photo-1548839140-29a749e1cf4d'), nutrition: n(0, 0, 0, 0, 0, 0, 0, 0, 0) },

  { id: 'keripik', name: 'Keripik', category: 'cemilan', servingLabel: '1 genggam', imageUrl: img('photo-1566478989037-eec17017d0b4'), nutrition: n(160, 2, 15, 1, 10, 3, 180, 1, 0) },
  { id: 'roti_tawar', name: 'Roti tawar', category: 'cemilan', servingLabel: '2 lembar', imageUrl: img('photo-1509440159596-0249088772ff'), nutrition: n(160, 6, 30, 4, 2, 0.5, 300, 1.6, 0) },
  { id: 'gorengan', name: 'Gorengan', category: 'cemilan', servingLabel: '2 buah', imageUrl: img('photo-1601050690597-df0548c2ca2b'), nutrition: n(200, 4, 18, 2, 12, 4, 280, 1, 15) },
  { id: 'biskuit', name: 'Biskuit', category: 'cemilan', servingLabel: '4 keping', imageUrl: img('photo-1558961363-fa8fdf82db35'), nutrition: n(140, 2, 18, 8, 6, 3, 90, 0.5, 5) },
  { id: 'yogurt', name: 'Yogurt', category: 'cemilan', servingLabel: '1 cup', imageUrl: img('photo-1488477181946-6428a0291777'), nutrition: n(120, 6, 17, 15, 3, 2, 80, 0, 10) },
];

const FOOD_BY_ID = new Map(FOOD_CATALOG.map((food) => [food.id, food]));

export function getFoodById(id: string): FoodItem | undefined {
  return FOOD_BY_ID.get(id);
}

export function searchFoods(query: string, category: FoodCategory | 'all'): FoodItem[] {
  const needle = query.trim().toLowerCase();
  return FOOD_CATALOG.filter((food) => {
    if (category !== 'all' && food.category !== category) return false;
    if (!needle) return true;
    return food.name.toLowerCase().includes(needle);
  });
}
