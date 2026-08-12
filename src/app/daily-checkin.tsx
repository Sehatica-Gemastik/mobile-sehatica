import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { Colors, Fonts, FontSize, Spacing } from '@/constants/theme';
import {
  BigNumberField, ChipRow, OptionList, QuestionCopy, QuestionnaireShell,
} from '@/components/questionnaire';
import { FoodDiary } from '@/components/food-diary';
import {
  ALCOHOL_FREQUENCY_OPTIONS, BINGE_FREQUENCY_OPTIONS, DAY_CHIPS, HOUR_CHIPS,
  MINUTE_CHIPS, YES_NO_OPTIONS,
} from '@/features/lifestyle/options';
import { ActivityDraft, DailyDraft } from '@/features/lifestyle/types';
import { dailyDraftFromCheckin, emptyDailyDraft } from '@/features/lifestyle/defaults';
import { deriveActivity, normalizeAlcohol } from '@/features/lifestyle/derived';
import { isNutritionReady, resolveDailyNutrition } from '@/features/lifestyle/nutrition-engine';
import { useLifestyleStore } from '@/store/lifestyle-store';
import { localDateKey } from '@/utils/local-date';

type ActivityKey =
  | 'vigorous_work'
  | 'moderate_work'
  | 'transport_walking_biking'
  | 'vigorous_recreation'
  | 'moderate_recreation';

type ActivityStep = {
  id: ActivityKey;
  kicker: string;
  title: string;
  subtitle: string;
  daysKey: keyof ActivityDraft;
  minutesKey: keyof ActivityDraft;
};

const ACTIVITY_STEPS: ActivityStep[] = [
  {
    id: 'vigorous_work',
    kicker: 'Aktivitas kerja',
    title: 'Apakah kamu melakukan aktivitas berat saat bekerja?',
    subtitle: 'Contoh: mengangkat beban, menggali, atau kerja fisik yang membuat napas terengah.',
    daysKey: 'vigorous_work_days',
    minutesKey: 'vigorous_work_minutes',
  },
  {
    id: 'moderate_work',
    kicker: 'Aktivitas kerja',
    title: 'Apakah ada aktivitas sedang saat bekerja?',
    subtitle: 'Contoh: jalan cepat di tempat kerja atau membawa barang ringan.',
    daysKey: 'moderate_work_days',
    minutesKey: 'moderate_work_minutes',
  },
  {
    id: 'transport_walking_biking',
    kicker: 'Transportasi',
    title: 'Apakah kamu jalan kaki atau bersepeda untuk bepergian?',
    subtitle: 'Bukan olahraga, melainkan perjalanan sehari-hari.',
    daysKey: 'transport_days',
    minutesKey: 'transport_minutes',
  },
  {
    id: 'vigorous_recreation',
    kicker: 'Rekreasi',
    title: 'Apakah kamu olahraga berat di waktu luang?',
    subtitle: 'Contoh: lari, sepak bola, atau latihan intens.',
    daysKey: 'vigorous_recreation_days',
    minutesKey: 'vigorous_recreation_minutes',
  },
  {
    id: 'moderate_recreation',
    kicker: 'Rekreasi',
    title: 'Apakah kamu olahraga sedang di waktu luang?',
    subtitle: 'Contoh: jalan cepat, bersepeda santai, atau yoga.',
    daysKey: 'moderate_recreation_days',
    minutesKey: 'moderate_recreation_minutes',
  },
];

type StepId =
  | ActivityKey
  | 'sedentary'
  | 'nutrition'
  | 'alcohol_ever'
  | 'alcohol_frequency'
  | 'alcohol_drinks'
  | 'alcohol_binge';

function visibleSteps(draft: DailyDraft): StepId[] {
  const steps: StepId[] = [
    ...ACTIVITY_STEPS.map((step) => step.id),
    'sedentary',
    'nutrition',
    'alcohol_ever',
  ];
  if (draft.alcohol_ever === 1) {
    steps.push('alcohol_frequency', 'alcohol_drinks', 'alcohol_binge');
  }
  return steps;
}

function nutritionComplete(draft: DailyDraft): boolean {
  return isNutritionReady(draft);
}

function activityComplete(draft: DailyDraft, step: ActivityStep): boolean {
  const flag = draft[step.id];
  if (flag === 0) return true;
  if (flag !== 1) return false;
  const days = draft[step.daysKey];
  const minutes = draft[step.minutesKey];
  return typeof days === 'number' && days >= 1 && days <= 7
    && typeof minutes === 'number' && minutes > 0;
}

export default function DailyCheckinScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const latest = useLifestyleStore((s) => s.daily);
  const saveDaily = useLifestyleStore((s) => s.saveDaily);
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<DailyDraft>(() => (
    latest ? dailyDraftFromCheckin(latest) : emptyDailyDraft()
  ));

  const steps = useMemo(() => visibleSteps(draft), [draft]);
  const safeIndex = Math.min(index, steps.length - 1);
  const stepId = steps[safeIndex];
  const activity = ACTIVITY_STEPS.find((item) => item.id === stepId);
  const isLast = safeIndex === steps.length - 1;

  const canContinue = useMemo(() => {
    if (activity) return activityComplete(draft, activity);
    if (stepId === 'sedentary') return draft.sedentary_hours >= 0 && draft.sedentary_hours <= 24;
    if (stepId === 'nutrition') return nutritionComplete(draft);
    if (stepId === 'alcohol_ever') return draft.alcohol_ever === 0 || draft.alcohol_ever === 1;
    if (stepId === 'alcohol_frequency') return draft.alcohol_frequency >= 0;
    if (stepId === 'alcohol_drinks') return draft.alcohol_drinks_per_day >= 1;
    if (stepId === 'alcohol_binge') return draft.alcohol_binge_frequency >= 0;
    return false;
  }, [activity, draft, stepId]);

  const patch = (partial: Partial<DailyDraft>) => {
    setDraft((current) => ({ ...current, ...partial }));
  };

  const finish = async () => {
    const alcohol = normalizeAlcohol(draft);
    const derived = deriveActivity({
      ...draft,
      vigorous_work: draft.vigorous_work === 1 ? 1 : 0,
      moderate_work: draft.moderate_work === 1 ? 1 : 0,
      transport_walking_biking: draft.transport_walking_biking === 1 ? 1 : 0,
      vigorous_recreation: draft.vigorous_recreation === 1 ? 1 : 0,
      moderate_recreation: draft.moderate_recreation === 1 ? 1 : 0,
      sedentary_hours: Math.max(0, draft.sedentary_hours),
    });

    setSaving(true);
    try {
      await saveDaily({
        date: localDateKey(),
        vigorous_work: draft.vigorous_work === 1 ? 1 : 0,
        vigorous_work_days: draft.vigorous_work === 1 ? draft.vigorous_work_days : 0,
        vigorous_work_minutes: draft.vigorous_work === 1 ? draft.vigorous_work_minutes : 0,
        moderate_work: draft.moderate_work === 1 ? 1 : 0,
        moderate_work_days: draft.moderate_work === 1 ? draft.moderate_work_days : 0,
        moderate_work_minutes: draft.moderate_work === 1 ? draft.moderate_work_minutes : 0,
        transport_walking_biking: draft.transport_walking_biking === 1 ? 1 : 0,
        transport_days: draft.transport_walking_biking === 1 ? draft.transport_days : 0,
        transport_minutes: draft.transport_walking_biking === 1 ? draft.transport_minutes : 0,
        vigorous_recreation: draft.vigorous_recreation === 1 ? 1 : 0,
        vigorous_recreation_days: draft.vigorous_recreation === 1 ? draft.vigorous_recreation_days : 0,
        vigorous_recreation_minutes: draft.vigorous_recreation === 1 ? draft.vigorous_recreation_minutes : 0,
        moderate_recreation: draft.moderate_recreation === 1 ? 1 : 0,
        moderate_recreation_days: draft.moderate_recreation === 1 ? draft.moderate_recreation_days : 0,
        moderate_recreation_minutes: draft.moderate_recreation === 1 ? draft.moderate_recreation_minutes : 0,
        ...resolveDailyNutrition(draft),
        meals: draft.meals,
        nutritionManual: draft.nutritionManual,
        ...alcohol,
        ...derived,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Gagal', err.message ?? 'Kuisioner belum tersimpan.');
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (isLast) {
      void finish();
      return;
    }
    setIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  return (
    <QuestionnaireShell
      progress={(safeIndex + 1) / steps.length}
      stepLabel={`${safeIndex + 1} / ${steps.length}`}
      onBack={safeIndex > 0 ? () => setIndex((current) => current - 1) : () => router.back()}
      footerLabel={isLast ? 'Simpan kuisioner' : 'Lanjut'}
      onFooterPress={next}
      footerDisabled={!canContinue}
      footerLoading={saving}
    >
      {activity ? (
        <View style={styles.block}>
          <QuestionCopy kicker={activity.kicker} title={activity.title} subtitle={activity.subtitle} />
          <OptionList
            options={YES_NO_OPTIONS}
            value={draft[activity.id] === 0 || draft[activity.id] === 1 ? draft[activity.id] : null}
            onChange={(value) => {
              if (value === 0) {
                patch({
                  [activity.id]: 0,
                  [activity.daysKey]: 0,
                  [activity.minutesKey]: 0,
                } as Partial<DailyDraft>);
                return;
              }
              patch({ [activity.id]: 1 } as Partial<DailyDraft>);
            }}
          />
          {draft[activity.id] === 1 ? (
            <View style={styles.followup}>
              <Text style={[styles.followLabel, { color: colors.text }]}>Berapa hari dalam seminggu?</Text>
              <ChipRow
                values={DAY_CHIPS}
                selected={typeof draft[activity.daysKey] === 'number' && (draft[activity.daysKey] as number) > 0
                  ? (draft[activity.daysKey] as number)
                  : null}
                onChange={(value) => patch({ [activity.daysKey]: value } as Partial<DailyDraft>)}
                suffix="hari"
              />
              <Text style={[styles.followLabel, { color: colors.text }]}>Berapa menit per hari?</Text>
              <ChipRow
                values={MINUTE_CHIPS}
                selected={MINUTE_CHIPS.includes(draft[activity.minutesKey] as number)
                  ? (draft[activity.minutesKey] as number)
                  : null}
                onChange={(value) => patch({ [activity.minutesKey]: value } as Partial<DailyDraft>)}
                suffix="mnt"
              />
              <BigNumberField
                value={draft[activity.minutesKey] > 0 ? String(draft[activity.minutesKey]) : ''}
                onChangeText={(text) => patch({
                  [activity.minutesKey]: Number(text.replace(/[^0-9]/g, '')) || 0,
                } as Partial<DailyDraft>)}
                unit="menit"
                placeholder="30"
              />
            </View>
          ) : null}
        </View>
      ) : null}

      {stepId === 'sedentary' ? (
        <View style={styles.block}>
          <QuestionCopy
            kicker="Waktu duduk"
            title="Berapa lama kamu duduk atau rebahan dalam sehari?"
            subtitle="Tidak termasuk tidur malam."
          />
          <ChipRow
            values={HOUR_CHIPS}
            selected={HOUR_CHIPS.includes(draft.sedentary_hours) ? draft.sedentary_hours : null}
            onChange={(value) => patch({ sedentary_hours: value })}
            suffix="jam"
          />
          <BigNumberField
            value={draft.sedentary_hours >= 0 ? String(draft.sedentary_hours) : ''}
            onChangeText={(text) => {
              const nextValue = Number(text.replace(',', '.'));
              patch({ sedentary_hours: Number.isFinite(nextValue) ? nextValue : -1 });
            }}
            unit="jam/hari"
            placeholder="6"
          />
        </View>
      ) : null}

      {stepId === 'nutrition' ? (
        <View style={styles.block}>
          <QuestionCopy
            kicker="Makan hari ini"
            title="Apa yang kamu makan hari ini?"
            subtitle="Tambah makanan yang kamu makan hari ini. Angka nutrisi dihitung otomatis."
          />
          <FoodDiary
            meals={draft.meals}
            nutrition={draft}
            nutritionManual={draft.nutritionManual}
            onChangeMeals={(meals) => patch({ meals })}
            onChangeNutrition={(nutrition) => patch(nutrition)}
            onToggleManual={(enabled, prefill) => {
              if (enabled) {
                patch({ nutritionManual: true, ...(prefill ?? {}) });
                return;
              }
              patch({ nutritionManual: false });
            }}
          />
        </View>
      ) : null}

      {stepId === 'alcohol_ever' ? (
        <View style={styles.block}>
          <QuestionCopy
            kicker="Alkohol"
            title="Apakah kamu pernah mengonsumsi alkohol?"
          />
          <OptionList
            options={YES_NO_OPTIONS}
            value={draft.alcohol_ever === 0 || draft.alcohol_ever === 1 ? draft.alcohol_ever : null}
            onChange={(value) => {
              if (value === 0) {
                patch({
                  alcohol_ever: 0,
                  alcohol_frequency: 0,
                  alcohol_drinks_per_day: 0,
                  alcohol_binge_frequency: 0,
                });
                return;
              }
              patch({ alcohol_ever: 1 });
            }}
          />
        </View>
      ) : null}

      {stepId === 'alcohol_frequency' ? (
        <View style={styles.block}>
          <QuestionCopy kicker="Alkohol" title="Seberapa sering kamu minum dalam setahun terakhir?" />
          <OptionList
            options={ALCOHOL_FREQUENCY_OPTIONS}
            value={draft.alcohol_frequency >= 0 ? draft.alcohol_frequency : null}
            onChange={(alcohol_frequency) => patch({ alcohol_frequency })}
          />
        </View>
      ) : null}

      {stepId === 'alcohol_drinks' ? (
        <View style={styles.block}>
          <QuestionCopy
            kicker="Alkohol"
            title="Berapa gelas dalam sehari, saat kamu minum?"
          />
          <BigNumberField
            value={draft.alcohol_drinks_per_day > 0 ? String(draft.alcohol_drinks_per_day) : ''}
            onChangeText={(text) => patch({
              alcohol_drinks_per_day: Number(text.replace(/[^0-9]/g, '')) || 0,
            })}
            unit="gelas"
            placeholder="2"
          />
        </View>
      ) : null}

      {stepId === 'alcohol_binge' ? (
        <View style={styles.block}>
          <QuestionCopy
            kicker="Alkohol"
            title="Seberapa sering minum 4-5 gelas atau lebih dalam satu kesempatan?"
          />
          <OptionList
            options={BINGE_FREQUENCY_OPTIONS}
            value={draft.alcohol_binge_frequency >= 0 ? draft.alcohol_binge_frequency : null}
            onChange={(alcohol_binge_frequency) => patch({ alcohol_binge_frequency })}
          />
        </View>
      ) : null}
    </QuestionnaireShell>
  );
}

const styles = StyleSheet.create({
  block: { gap: Spacing.xl },
  followup: { gap: Spacing.md },
  followLabel: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
});
