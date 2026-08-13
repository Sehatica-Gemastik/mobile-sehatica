import React, { useMemo, useState } from 'react';
import {
  Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity,
  View, useColorScheme, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, nativeReset, Shadows } from '@/constants/theme';
import { Button, Icon, ScreenHeader } from '@/components/ui';
import { AppScreen } from '@/components/screen-background';
import { computeBmi } from '@/features/lifestyle/derived';
import { useLifestyleStore } from '@/store/lifestyle-store';

function parsePositive(value: string): number | null {
  const n = Number(value.replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export default function WeeklyCheckinScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const weekly = useLifestyleStore((s) => s.weekly);
  const saveWeekly = useLifestyleStore((s) => s.saveWeekly);

  const [weight, setWeight] = useState(weekly ? String(weekly.weight_kg) : '');
  const [height, setHeight] = useState(weekly ? String(weekly.height_cm) : '');
  const [waist, setWaist] = useState(weekly ? String(weekly.waist_cm) : '');
  const [systolic, setSystolic] = useState(weekly ? String(weekly.systolic_bp) : '');
  const [diastolic, setDiastolic] = useState(weekly ? String(weekly.diastolic_bp) : '');
  const [saving, setSaving] = useState(false);

  const weightKg = parsePositive(weight);
  const heightCm = parsePositive(height);
  const waistCm = parsePositive(waist);
  const systolicBp = parsePositive(systolic);
  const diastolicBp = parsePositive(diastolic);
  const bmi = weightKg && heightCm ? computeBmi(weightKg, heightCm) : null;

  const valid = useMemo(() => {
    if (weightKg == null || weightKg < 20 || weightKg > 300) return false;
    if (heightCm == null || heightCm < 100 || heightCm > 250) return false;
    if (waistCm == null || waistCm < 40 || waistCm > 200) return false;
    if (systolicBp == null || systolicBp < 70 || systolicBp > 250) return false;
    if (diastolicBp == null || diastolicBp < 40 || diastolicBp > 150) return false;
    if (systolicBp <= diastolicBp) return false;
    return bmi != null;
  }, [bmi, diastolicBp, heightCm, systolicBp, waistCm, weightKg]);

  const save = async () => {
    if (!valid || weightKg == null || heightCm == null || waistCm == null || systolicBp == null || diastolicBp == null || bmi == null) {
      Alert.alert('Belum lengkap', 'Isi berat, tinggi, lingkar pinggang, dan tekanan darah dengan angka yang masuk akal.');
      return;
    }
    setSaving(true);
    try {
      await saveWeekly({
        weight_kg: weightKg,
        height_cm: heightCm,
        bmi,
        waist_cm: waistCm,
        systolic_bp: systolicBp,
        diastolic_bp: diastolicBp,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Gagal', err.message ?? 'Data mingguan belum tersimpan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppScreen style={styles.container}>
      <ScreenHeader
        title="Cek mingguan"
        subtitle="Isi sekali, lalu perbarui setiap minggu"
        right={(
          <TouchableOpacity
            accessibilityLabel="Tutup"
            onPress={() => router.back()}
            style={[styles.closeButton, { backgroundColor: colors.backgroundElement }]}
          >
            <Icon name="close" size="sm" color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, Shadows.sm, { backgroundColor: colors.backgroundCard }]}>
            <Text style={[styles.cardKicker, { color: colors.primary }]}>TUBUH</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Berat dan ukuran</Text>

            <Field
              label="Berat"
              value={weight}
              onChangeText={setWeight}
              unit="kg"
              colors={colors}
            />
            <Field
              label="Tinggi"
              value={height}
              onChangeText={setHeight}
              unit="cm"
              colors={colors}
            />

            <View style={[styles.bmiRow, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.bmiLabel, { color: colors.primaryDark }]}>BMI</Text>
              <Text style={[styles.bmiValue, { color: colors.primaryDark }]}>
                {bmi != null ? `${bmi} kg/m²` : 'Otomatis dari berat dan tinggi'}
              </Text>
            </View>

            <Field
              label="Lingkar pinggang"
              value={waist}
              onChangeText={setWaist}
              unit="cm"
              colors={colors}
            />
          </View>

          <View style={[styles.card, Shadows.sm, { backgroundColor: colors.backgroundCard }]}>
            <Text style={[styles.cardKicker, { color: colors.primary }]}>TEKANAN DARAH</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Sistolik dan diastolik</Text>
            <Text style={[styles.cardHint, { color: colors.textMuted }]}>
              Dipakai untuk pemantauan. Tidak dikirim ke model hipertensi.
            </Text>

            <Field
              label="Sistolik"
              value={systolic}
              onChangeText={setSystolic}
              unit="mmHg"
              colors={colors}
            />
            <Field
              label="Diastolik"
              value={diastolic}
              onChangeText={setDiastolic}
              unit="mmHg"
              colors={colors}
            />

            <View style={[styles.bpPreview, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.bpValue, { color: colors.text }]}>
                {systolicBp && diastolicBp ? `${Math.round(systolicBp)} / ${Math.round(diastolicBp)} mmHg` : '-- / -- mmHg'}
              </Text>
            </View>
          </View>

          <Button
            label={weekly ? 'Perbarui data minggu ini' : 'Simpan data tubuh'}
            loadingLabel="Menyimpan..."
            onPress={() => void save()}
            disabled={!valid || saving}
            loading={saving}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

function Field({
  label, value, onChangeText, unit, colors,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.fieldWrap, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          style={[styles.fieldInput, { color: colors.text }]}
          underlineColorAndroid="transparent"
          selectionColor={colors.primary}
        />
        <Text style={[styles.fieldUnit, { color: colors.textMuted }]}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  closeButton: {
    width: 36, height: 36, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.lg },
  card: { borderRadius: BorderRadius.xl, padding: Spacing.base, gap: Spacing.md },
  cardKicker: { fontSize: 11, fontFamily: Fonts.bold, letterSpacing: 0.6 },
  cardTitle: { fontSize: FontSize.lg, fontFamily: Fonts.bold, marginTop: -6 },
  cardHint: { fontSize: FontSize.xs, lineHeight: 18, fontFamily: Fonts.regular, marginTop: -8 },
  field: { gap: 6 },
  fieldLabel: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  fieldWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: BorderRadius.md,
    paddingHorizontal: 14, minHeight: 48,
  },
  fieldInput: {
    flex: 1, fontSize: FontSize.md, fontFamily: Fonts.medium, padding: 0,
    ...(Platform.OS === 'web' ? nativeReset : null),
  },
  fieldUnit: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
  bmiRow: {
    borderRadius: BorderRadius.md, padding: Spacing.base,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  bmiLabel: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  bmiValue: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
  bpPreview: {
    borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: 'center',
  },
  bpValue: { fontSize: FontSize.xl, fontFamily: Fonts.bold, letterSpacing: -0.4 },
});
