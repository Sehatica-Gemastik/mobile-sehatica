import React, { useMemo, useState } from 'react';
import {
  Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goBackOr } from '@/utils/go-back';
import { useQueryClient } from '@tanstack/react-query';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { AppScreen } from '@/components/screen-background';
import { useScreenTopPadding } from '@/hooks/use-screen-top-padding';
import { Button, Icon, surfaceHeaderShell } from '@/components/ui';
import {
  BigNumberField, OptionList, QuestionCopy,
} from '@/components/questionnaire';
import {
  EDUCATION_OPTIONS, INCOME_OPTIONS, RACE_OPTIONS, SEX_OPTIONS,
} from '@/features/lifestyle/options';
import { useLifestyleStore } from '@/store/lifestyle-store';

type Draft = {
  age: string;
  sex: number | null;
  race_ethnicity: number | null;
  education: number | null;
  income_poverty_ratio: number | null;
};

function draftFromIdentity(identity: ReturnType<typeof useLifestyleStore.getState>['identity']): Draft {
  return {
    age: identity ? String(identity.age) : '',
    sex: identity?.sex ?? null,
    race_ethnicity: identity?.race_ethnicity ?? null,
    education: identity?.education ?? null,
    income_poverty_ratio: identity?.income_poverty_ratio ?? null,
  };
}

export default function EditIdentityScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const topPadding = useScreenTopPadding();
  const queryClient = useQueryClient();
  const identity = useLifestyleStore((state) => state.identity);
  const saveIdentity = useLifestyleStore((state) => state.saveIdentity);
  const [draft, setDraft] = useState<Draft>(() => draftFromIdentity(identity));
  const [saving, setSaving] = useState(false);

  const ageValue = Number(draft.age);
  const ageValid = Number.isFinite(ageValue) && ageValue >= 18 && ageValue <= 120;

  const canSave = useMemo(() => (
    ageValid
    && draft.sex != null
    && draft.race_ethnicity != null
    && draft.education != null
    && draft.income_poverty_ratio != null
  ), [ageValid, draft]);

  const save = async () => {
    if (!canSave || draft.sex == null || draft.race_ethnicity == null || draft.education == null || draft.income_poverty_ratio == null) {
      Alert.alert('Belum lengkap', 'Lengkapi semua field data diri.');
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
      await queryClient.invalidateQueries({ queryKey: ['ptm-risk'] });
      goBackOr('/account');
    } catch (err: any) {
      Alert.alert('Gagal', err.message ?? 'Data diri belum tersimpan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppScreen style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <View style={[styles.header, surfaceHeaderShell(colors), { paddingTop: topPadding, backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => goBackOr('/account')} style={styles.backBtn} activeOpacity={0.7}>
            <Icon name="arrow-back" size="md" color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Edit data diri</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={[styles.lead, { color: colors.textMuted }]}>
            Data ini dipakai untuk menghitung skor risiko PTM. Perubahan disimpan di perangkat ini.
          </Text>

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

          <View style={styles.block}>
            <QuestionCopy kicker="Data diri" title="Jenis kelamin kamu?" />
            <OptionList
              options={SEX_OPTIONS}
              value={draft.sex}
              onChange={(sex) => setDraft((current) => ({ ...current, sex }))}
            />
          </View>

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

          <View style={styles.block}>
            <QuestionCopy kicker="Data diri" title="Pendidikan terakhir?" />
            <OptionList
              options={EDUCATION_OPTIONS}
              value={draft.education}
              onChange={(education) => setDraft((current) => ({ ...current, education }))}
            />
          </View>

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
          </View>

          <Button
            label="Simpan perubahan"
            onPress={() => void save()}
            loading={saving}
            disabled={!canSave}
            fullWidth
          />
        </ScrollView>
      </SafeAreaView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.md,
    fontFamily: Fonts.bold,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
  lead: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.regular,
    lineHeight: 18,
  },
  block: { gap: Spacing.lg },
});
