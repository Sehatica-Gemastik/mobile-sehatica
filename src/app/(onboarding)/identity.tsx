import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { Icon } from '@/components/ui';
import {
  BigNumberField, OptionList, QuestionCopy, QuestionnaireShell,
} from '@/components/questionnaire';
import {
  EDUCATION_OPTIONS, INCOME_OPTIONS, RACE_OPTIONS, SEX_OPTIONS,
} from '@/features/lifestyle/options';
import { useLifestyleStore } from '@/store/lifestyle-store';
import { useAuthStore } from '@/store/auth-store';

type Draft = {
  age: string;
  sex: number | null;
  race_ethnicity: number | null;
  education: number | null;
  income_poverty_ratio: number | null;
};

const TOTAL = 6;

export default function IdentityScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const { saveIdentity } = useLifestyleStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    age: '',
    sex: null,
    race_ethnicity: null,
    education: null,
    income_poverty_ratio: null,
  });

  const ageValue = Number(draft.age);
  const ageValid = Number.isFinite(ageValue) && ageValue >= 18 && ageValue <= 120;

  const canContinue = useMemo(() => {
    if (step === 0) return true;
    if (step === 1) return ageValid;
    if (step === 2) return draft.sex != null;
    if (step === 3) return draft.race_ethnicity != null;
    if (step === 4) return draft.education != null;
    if (step === 5) return draft.income_poverty_ratio != null;
    return false;
  }, [ageValid, draft, step]);

  const finish = async () => {
    if (!ageValid || draft.sex == null || draft.race_ethnicity == null || draft.education == null || draft.income_poverty_ratio == null) {
      Alert.alert('Belum lengkap', 'Lengkapi data diri sebelum masuk.');
      return;
    }
    setSaving(true);
    try {
      await saveIdentity({
        age: ageValue,
        sex: draft.sex,
        race_ethnicity: draft.race_ethnicity,
        education: draft.education,
        income_poverty_ratio: draft.income_poverty_ratio,
      });
      router.replace(isAuthenticated ? '/(tabs)' : '/(auth)/login');
    } catch (err: any) {
      Alert.alert('Gagal', err.message ?? 'Data diri belum tersimpan.');
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (step === TOTAL - 1) {
      void finish();
      return;
    }
    setStep((current) => current + 1);
  };

  return (
    <QuestionnaireShell
      progress={(step + 1) / TOTAL}
      stepLabel={`${step + 1} / ${TOTAL}`}
      onBack={step > 0 ? () => setStep((current) => current - 1) : undefined}
      footerLabel={step === 0 ? 'Mulai' : step === TOTAL - 1 ? 'Simpan dan lanjut' : 'Lanjut'}
      onFooterPress={next}
      footerDisabled={!canContinue}
      footerLoading={saving}
    >
      {step === 0 ? (
        <View style={styles.welcome}>
          <View style={[styles.logo, { backgroundColor: colors.primaryLight }]}>
            <Icon name="leaf-outline" size="lg" color={colors.primary} />
          </View>
          <QuestionCopy
            title="Sebelum masuk, kenalan dulu"
            subtitle="Lima pertanyaan singkat tentang dirimu. Cukup isi sekali, nanti bisa dipakai untuk pemantauan kesehatan."
          />
        </View>
      ) : null}

      {step === 1 ? (
        <View style={styles.block}>
          <QuestionCopy
            kicker="Data diri"
            title="Berapa usia kamu?"
            subtitle="Model ini untuk dewasa, jadi usia minimal 18 tahun."
          />
          <BigNumberField
            value={draft.age}
            onChangeText={(age) => setDraft((current) => ({ ...current, age: age.replace(/[^0-9]/g, '') }))}
            unit="tahun"
            placeholder="25"
            maxLength={3}
          />
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.block}>
          <QuestionCopy kicker="Data diri" title="Jenis kelamin kamu?" />
          <OptionList
            options={SEX_OPTIONS}
            value={draft.sex}
            onChange={(sex) => setDraft((current) => ({ ...current, sex }))}
          />
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.block}>
          <QuestionCopy
            kicker="Data diri"
            title="Latar belakang yang paling mendekati?"
            subtitle="Pilihan ini mengikuti kategori data penelitian, bukan identitas formal."
          />
          <OptionList
            options={RACE_OPTIONS}
            value={draft.race_ethnicity}
            onChange={(race_ethnicity) => setDraft((current) => ({ ...current, race_ethnicity }))}
          />
        </View>
      ) : null}

      {step === 4 ? (
        <View style={styles.block}>
          <QuestionCopy kicker="Data diri" title="Pendidikan terakhir?" />
          <OptionList
            options={EDUCATION_OPTIONS}
            value={draft.education}
            onChange={(education) => setDraft((current) => ({ ...current, education }))}
          />
        </View>
      ) : null}

      {step === 5 ? (
        <View style={styles.block}>
          <QuestionCopy
            kicker="Data diri"
            title="Bagaimana kondisi ekonomi rumah tangga kamu?"
            subtitle="Perkiraan saja, tidak perlu angka penghasilan."
          />
          <OptionList
            options={INCOME_OPTIONS}
            value={draft.income_poverty_ratio}
            onChange={(income_poverty_ratio) => setDraft((current) => ({ ...current, income_poverty_ratio }))}
          />
          <Text style={[styles.note, { color: colors.textMuted }]}>
            Jawaban disimpan di perangkat ini.
          </Text>
        </View>
      ) : null}
    </QuestionnaireShell>
  );
}

const styles = StyleSheet.create({
  welcome: { gap: Spacing.xl, paddingTop: Spacing.xxl },
  logo: {
    width: 64, height: 64, borderRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  block: { gap: Spacing.xl },
  note: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
});
