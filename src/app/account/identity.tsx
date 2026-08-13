import React, { useMemo, useState } from 'react';
import {
  Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import { identityInputToPayload, userToIdentityProfile } from '@/features/identity/user-identity';
import { goBackOr } from '@/utils/go-back';

type Draft = {
  age: string;
  sex: number | null;
  race_ethnicity: number | null;
  education: number | null;
  income_poverty_ratio: number | null;
};

function draftFromUser(user: ReturnType<typeof useAuthStore.getState>['user']): Draft {
  const identity = userToIdentityProfile(user);
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
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [draft, setDraft] = useState<Draft>(() => draftFromUser(user));
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
      const updated = await authService.saveIdentity(identityInputToPayload({
        age: ageValue,
        sex: draft.sex,
        race_ethnicity: draft.race_ethnicity,
        education: draft.education,
        income_poverty_ratio: draft.income_poverty_ratio,
      }));
      setUser(updated);
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
            Data ini dipakai untuk menghitung skor risiko PTM dan disimpan di akun kamu.
          </Text>

          <View style={styles.block}>
            <QuestionCopy kicker="Data diri" title="Berapa usia kamu?" subtitle="Usia minimal 18 tahun." />
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
            <OptionList options={SEX_OPTIONS} value={draft.sex} onChange={(sex) => setDraft((c) => ({ ...c, sex }))} layout="stack" />
          </View>

          <View style={styles.block}>
            <QuestionCopy kicker="Data diri" title="Latar belakang yang paling mendekati?" />
            <OptionList options={RACE_OPTIONS} value={draft.race_ethnicity} onChange={(v) => setDraft((c) => ({ ...c, race_ethnicity: v }))} />
          </View>

          <View style={styles.block}>
            <QuestionCopy kicker="Data diri" title="Pendidikan terakhir?" />
            <OptionList options={EDUCATION_OPTIONS} value={draft.education} onChange={(v) => setDraft((c) => ({ ...c, education: v }))} />
          </View>

          <View style={styles.block}>
            <QuestionCopy kicker="Data diri" title="Kondisi ekonomi rumah tangga?" />
            <OptionList options={INCOME_OPTIONS} value={draft.income_poverty_ratio} onChange={(v) => setDraft((c) => ({ ...c, income_poverty_ratio: v }))} layout="stack" />
          </View>

          <Button label="Simpan perubahan" onPress={() => void save()} loading={saving} disabled={!canSave} fullWidth />
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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.md, fontFamily: Fonts.bold },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.xl },
  lead: { fontSize: FontSize.xs, fontFamily: Fonts.regular, lineHeight: 18, textAlign: 'center' },
  block: { gap: Spacing.lg, width: '100%' },
});
