import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView,
  useColorScheme, Dimensions, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, nativeReset, Shadows } from '@/constants/theme';
import { Button, Icon, TextField } from '@/components/ui';
import { AppScreen } from '@/components/screen-background';
import { MealEntry, FoodCategory } from '@/features/lifestyle/food-types';
import { NutritionDraft } from '@/features/lifestyle/types';
import {
  FOOD_CATEGORIES, getFoodById, searchFoods,
} from '@/features/lifestyle/food-catalog';
import { NUTRITION_FIELDS } from '@/features/lifestyle/options';
import { sumMealNutrition } from '@/features/lifestyle/nutrition-engine';

type Props = {
  meals: MealEntry[];
  nutrition: NutritionDraft;
  nutritionManual: boolean;
  onChangeMeals: (meals: MealEntry[]) => void;
  onChangeNutrition: (nutrition: Partial<NutritionDraft>) => void;
  onToggleManual: (enabled: boolean, prefill?: NutritionDraft) => void;
};

function createEntryId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function FoodDiary({
  meals, nutrition, nutritionManual, onChangeMeals, onChangeNutrition, onToggleManual,
}: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const [pickerOpen, setPickerOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(nutritionManual);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FoodCategory | 'all'>('all');

  const computed = useMemo(() => sumMealNutrition(meals), [meals]);
  const foods = useMemo(() => searchFoods(query, category), [query, category]);
  const cardWidth = (Dimensions.get('window').width - Spacing.lg * 2 - 10) / 2;
  const shown = manualOpen ? nutrition : computed;

  const openPicker = () => {
    setQuery('');
    setCategory('all');
    setPickerOpen(true);
  };

  const addFood = (foodId: string) => {
    const existing = meals.find((entry) => entry.foodId === foodId);
    if (existing) {
      onChangeMeals(meals.map((entry) => (
        entry.id === existing.id ? { ...entry, servings: entry.servings + 1 } : entry
      )));
      return;
    }
    onChangeMeals([...meals, { id: createEntryId(), meal: 'lunch', foodId, servings: 1 }]);
  };

  const removeFood = (entryId: string) => {
    onChangeMeals(meals.filter((entry) => entry.id !== entryId));
  };

  const toggleManual = () => {
    if (manualOpen) {
      setManualOpen(false);
      onToggleManual(false);
      return;
    }
    const prefill = meals.length > 0 ? computed : {
      calories_day1: nutrition.calories_day1 >= 0 ? nutrition.calories_day1 : 0,
      protein_g_day1: nutrition.protein_g_day1 >= 0 ? nutrition.protein_g_day1 : 0,
      carbohydrate_g_day1: nutrition.carbohydrate_g_day1 >= 0 ? nutrition.carbohydrate_g_day1 : 0,
      sugar_g_day1: nutrition.sugar_g_day1 >= 0 ? nutrition.sugar_g_day1 : 0,
      total_fat_g_day1: nutrition.total_fat_g_day1 >= 0 ? nutrition.total_fat_g_day1 : 0,
      saturated_fat_g_day1: nutrition.saturated_fat_g_day1 >= 0 ? nutrition.saturated_fat_g_day1 : 0,
      sodium_mg_day1: nutrition.sodium_mg_day1 >= 0 ? nutrition.sodium_mg_day1 : 0,
      fiber_g_day1: nutrition.fiber_g_day1 >= 0 ? nutrition.fiber_g_day1 : 0,
      cholesterol_mg_day1: nutrition.cholesterol_mg_day1 >= 0 ? nutrition.cholesterol_mg_day1 : 0,
      alcohol_g_day1: nutrition.alcohol_g_day1 >= 0 ? nutrition.alcohol_g_day1 : 0,
    };
    setManualOpen(true);
    onToggleManual(true, prefill);
  };

  return (
    <View style={styles.wrap}>
      {meals.length === 0 ? (
        <TouchableOpacity
          onPress={openPicker}
          style={[styles.emptyAdd, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}
          activeOpacity={0.75}
        >
          <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
            <Icon name="add" size="md" color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Tambah makanan</Text>
          <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Pilih dari daftar, nutrisi dihitung otomatis</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.listCard, { borderColor: colors.border }]}>
          {meals.map((entry, index) => {
            const food = getFoodById(entry.foodId);
            if (!food) return null;
            return (
              <View
                key={entry.id}
                style={[
                  styles.itemRow,
                  index < meals.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <Image source={{ uri: food.imageUrl }} style={styles.thumb} contentFit="cover" />
                <View style={styles.itemCopy}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{food.name}</Text>
                  <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                    {entry.servings} porsi · {food.nutrition.calories * entry.servings} kcal
                  </Text>
                </View>
                <TouchableOpacity
                  accessibilityLabel={`Hapus ${food.name}`}
                  onPress={() => removeFood(entry.id)}
                  style={[styles.removeBtn, { backgroundColor: colors.backgroundElement }]}
                  hitSlop={8}
                >
                  <Icon name="close" size="sm" color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            );
          })}
          <TouchableOpacity
            onPress={openPicker}
            style={styles.addMore}
            activeOpacity={0.75}
          >
            <Icon name="add" size="sm" color={colors.primary} />
            <Text style={[styles.addMoreLabel, { color: colors.primary }]}>Tambah makanan</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.summary, { backgroundColor: colors.primaryLight }]}>
        <Text style={[styles.summaryTitle, { color: colors.primaryDark }]}>
          Perkiraan {shown.calories_day1 >= 0 ? shown.calories_day1 : 0} kcal
        </Text>
        <Text style={[styles.summaryMeta, { color: colors.primaryDark }]}>
          Protein {shown.protein_g_day1 >= 0 ? shown.protein_g_day1 : 0} g
          {' · '}Karbo {shown.carbohydrate_g_day1 >= 0 ? shown.carbohydrate_g_day1 : 0} g
          {' · '}Lemak {shown.total_fat_g_day1 >= 0 ? shown.total_fat_g_day1 : 0} g
        </Text>
      </View>

      <TouchableOpacity
        onPress={toggleManual}
        activeOpacity={0.75}
        style={[styles.manualBtn, { borderColor: colors.border, backgroundColor: manualOpen ? colors.primaryLight : colors.backgroundCard }]}
      >
        <Icon
          name={manualOpen ? 'chevron-up' : 'create-outline'}
          size="sm"
          color={colors.primary}
        />
        <Text style={[styles.manualBtnLabel, { color: colors.primary }]}>
          {manualOpen ? 'Tutup isi manual' : 'Isi angka nutrisi sendiri'}
        </Text>
      </TouchableOpacity>

      {manualOpen ? (
        <View style={styles.manualFields}>
          {NUTRITION_FIELDS.map((field) => (
            <TextField
              key={field.key}
              label={`${field.label} (${field.unit})`}
              value={nutrition[field.key] >= 0 ? String(nutrition[field.key]) : ''}
              onChangeText={(text) => {
                const nextValue = Number(text.replace(',', '.'));
                onChangeNutrition({
                  [field.key]: Number.isFinite(nextValue) && nextValue >= 0 ? nextValue : -1,
                });
              }}
              keyboardType="decimal-pad"
              placeholder="0"
            />
          ))}
        </View>
      ) : null}

      <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <AppScreen style={styles.modal}>
          <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Pilih makanan</Text>
            <TouchableOpacity
              accessibilityLabel="Tutup"
              onPress={() => setPickerOpen(false)}
              style={[styles.closeBtn, { backgroundColor: colors.backgroundElement }]}
            >
              <Icon name="close" size="sm" color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.search, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <Icon name="search-outline" size="sm" color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Cari nasi, ayam, sayur..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
              underlineColorAndroid="transparent"
              selectionColor={colors.primary}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats} style={styles.catsWrap}>
            {FOOD_CATEGORIES.map((item) => {
              const active = category === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setCategory(item.id)}
                  style={[styles.cat, { backgroundColor: active ? colors.primary : colors.backgroundElement }]}
                >
                  <Text style={[styles.catLabel, { color: active ? colors.onPrimary : colors.textSecondary }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView style={styles.gridScroll} contentContainerStyle={styles.grid} keyboardShouldPersistTaps="handled">
            {foods.map((food) => {
              const selected = meals.some((entry) => entry.foodId === food.id);
              return (
                <TouchableOpacity
                  key={food.id}
                  onPress={() => addFood(food.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.card,
                    {
                      width: cardWidth,
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: colors.backgroundCard,
                    },
                  ]}
                >
                  <Image source={{ uri: food.imageUrl }} style={styles.cardImage} contentFit="cover" />
                  {selected ? (
                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                      <Icon name="checkmark" size="sm" color={colors.onPrimary} />
                    </View>
                  ) : null}
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>{food.name}</Text>
                    <Text style={[styles.cardMeta, { color: colors.textMuted }]}>{food.servingLabel}</Text>
                    <Text style={[styles.cardKcal, { color: colors.textSecondary }]}>{food.nutrition.calories} kcal</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.modalFooter}>
            <Button label="Selesai" onPress={() => setPickerOpen(false)} fullWidth />
          </View>
          </SafeAreaView>
        </AppScreen>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md },
  emptyAdd: {
    borderWidth: 1, borderStyle: 'dashed', borderRadius: BorderRadius.lg,
    paddingVertical: 28, paddingHorizontal: Spacing.base, alignItems: 'center', gap: 8,
  },
  emptyIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  emptyHint: { fontSize: FontSize.xs, fontFamily: Fonts.regular, textAlign: 'center' },
  listCard: { borderWidth: 1, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: Spacing.base, paddingVertical: 10,
  },
  thumb: { width: 44, height: 44, borderRadius: BorderRadius.sm, backgroundColor: '#F4F4F5' },
  itemCopy: { flex: 1, gap: 2 },
  itemName: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  itemMeta: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  removeBtn: {
    width: 32, height: 32, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  addMore: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14,
  },
  addMoreLabel: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  summary: { borderRadius: BorderRadius.md, padding: Spacing.base, gap: 4 },
  summaryTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  summaryMeta: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  manualBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderRadius: BorderRadius.md, paddingVertical: 14,
  },
  manualBtnLabel: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  manualFields: { gap: Spacing.base, paddingBottom: Spacing.lg },
  modal: { flex: 1 },
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.md,
  },
  modalTitle: { flex: 1, fontSize: FontSize.lg, fontFamily: Fonts.bold, letterSpacing: -0.3 },
  closeBtn: {
    width: 36, height: 36, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: Spacing.lg, borderWidth: 1, borderRadius: BorderRadius.md,
    paddingHorizontal: 12, minHeight: 44,
  },
  searchInput: {
    flex: 1, fontSize: FontSize.sm, fontFamily: Fonts.regular, padding: 0,
    ...(Platform.OS === 'web' ? nativeReset : null),
  },
  catsWrap: { flexGrow: 0 },
  cats: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: 8 },
  cat: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full },
  catLabel: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  gridScroll: { flex: 1 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg,
  },
  card: { borderWidth: 1, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  cardImage: { width: '100%', height: 110, backgroundColor: '#F4F4F5' },
  badge: {
    position: 'absolute', top: 8, right: 8, width: 24, height: 24,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { padding: 10, gap: 2 },
  cardName: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  cardMeta: { fontSize: 11, fontFamily: Fonts.regular },
  cardKcal: { fontSize: 11, fontFamily: Fonts.medium },
  modalFooter: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
});
