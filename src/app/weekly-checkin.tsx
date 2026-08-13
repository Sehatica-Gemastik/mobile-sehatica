import React, { useMemo, useState } from 'react';
import {
  Alert, ScrollView, StyleSheet, Text, TouchableOpacity,
  View, useColorScheme, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { Button, Icon, ScreenHeader, TextField } from '@/components/ui';
import { AppScreen } from '@/components/screen-background';
import { computeBmi } from '@/features/lifestyle/derived';
import { useLifestyleStore } from '@/store/lifestyle-store';

function parsePositive(value: string): number | null {
  const n = Number(value.replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export default function WeeklyCheckinScreen() {
  const queryClient = useQueryClient();
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
      queryClient.invalidateQueries({ queryKey: ['ptm-risk'] });
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
        surface={false}
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
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Berat dan ukuran</Text>
            <TextField
              label="Berat"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="0"
              suffix="kg"
            />
            <TextField
              label="Tinggi"
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              placeholder="0"
              suffix="cm"
            />
            <View style={[styles.infoRow, { borderColor: colors.borderLight }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>BMI</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {bmi != null ? `${bmi} kg/m²` : 'Otomatis dari berat dan tinggi'}
              </Text>
            </View>
            <TextField
              label="Lingkar pinggang"
              value={waist}
              onChangeText={setWaist}
              keyboardType="decimal-pad"
              placeholder="0"
              suffix="cm"
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tekanan darah</Text>
            <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
              Dipakai untuk pemantauan. Tidak dikirim ke model hipertensi.
            </Text>
            <TextField
              label="Sistolik"
              value={systolic}
              onChangeText={setSystolic}
              keyboardType="decimal-pad"
              placeholder="0"
              suffix="mmHg"
            />
            <TextField
              label="Diastolik"
              value={diastolic}
              onChangeText={setDiastolic}
              keyboardType="decimal-pad"
              placeholder="0"
              suffix="mmHg"
            />
            <View style={[styles.infoRow, { borderColor: colors.borderLight }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Preview</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.xl },
  section: { gap: Spacing.base },
  sectionTitle: { fontSize: FontSize.lg, fontFamily: Fonts.bold },
  sectionHint: { fontSize: FontSize.xs, lineHeight: 18, fontFamily: Fonts.regular, marginTop: -4 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoLabel: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  infoValue: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
});
