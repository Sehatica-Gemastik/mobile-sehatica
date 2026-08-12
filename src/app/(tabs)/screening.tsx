import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  SCREENING_CHECK_LABELS,
  SCREENING_FACTOR_LABELS,
  SCREENING_INSTRUMENT_VERSION,
  SCREENING_QUESTIONS,
} from '@/features/screening/screening-rules';
import { screeningService } from '@/services/screening.service';
import { BorderRadius, Colors, Fonts, FontSize, Spacing } from '@/constants/theme';
import { Button, Icon, ScreenHeader } from '@/components/ui';
import { ScreeningAnswer, ScreeningAnswers, ScreeningQuestionId } from '@/types';

const ANSWER_OPTIONS: { value: ScreeningAnswer; label: string }[] = [
  { value: 'yes', label: 'Ya' },
  { value: 'no', label: 'Tidak' },
  { value: 'unknown', label: 'Tidak tahu' },
];

export default function ScreeningScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Partial<ScreeningAnswers>>({});

  const { data: storedLatest, isLoading, error } = useQuery({
    queryKey: ['screening', 'latest'],
    queryFn: screeningService.latest,
  });

  const completeMutation = useMutation({
    mutationFn: screeningService.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screening'] });
      setAnswers({});
      Alert.alert('Tersimpan', 'Screening risiko PTM hari ini sudah disimpan.');
    },
    onError: (mutationError: Error) => Alert.alert('Screening gagal disimpan', mutationError.message),
  });

  const latest = completeMutation.data ?? storedLatest;
  const answeredCount = Object.keys(answers).length;
  const canComplete = answeredCount === SCREENING_QUESTIONS.length;

  const chooseAnswer = (questionId: ScreeningQuestionId, answer: ScreeningAnswer) => {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  };

  const complete = () => {
    if (!canComplete) {
      Alert.alert('Belum lengkap', 'Jawab semua pertanyaan sebelum melihat hasil.');
      return;
    }
    completeMutation.mutate(answers as ScreeningAnswers);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Screening risiko PTM"
        subtitle="Checklist faktor, bukan diagnosis"
        right={(
          <TouchableOpacity
            accessibilityLabel="Tutup screening"
            onPress={() => router.back()}
            style={[styles.closeButton, { backgroundColor: colors.backgroundElement }]}
          >
            <Icon name="close" size="sm" color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.notice, { backgroundColor: colors.blueLight }]}>
          <Icon name="shield-checkmark-outline" size="md" color={colors.blue} />
          <View style={styles.noticeText}>
            <Text style={[styles.noticeTitle, { color: colors.text }]}>Privat dan tersimpan lokal</Text>
            <Text style={[styles.noticeBody, { color: colors.textSecondary }]}>
              Jawaban disimpan di perangkat ini dan disinkronkan ke server untuk Heally & jadwal harian.
            </Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <View style={[styles.resultCard, { borderColor: colors.border }]}>
            <Text style={[styles.resultTitle, { color: colors.text }]}>Hasil lokal belum dapat dibuka</Text>
            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
              {error instanceof Error ? error.message : 'Coba buka kembali aplikasi.'}
            </Text>
          </View>
        ) : latest ? (
          <View style={[styles.resultCard, { borderColor: colors.border }]}>
            <View style={styles.resultHeading}>
              <View style={[
                styles.resultIcon,
                { backgroundColor: latest.factors.length > 0 ? colors.amberLight : colors.primaryLight },
              ]}>
                <Icon
                  name={latest.factors.length > 0 ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                  size="md"
                  color={latest.factors.length > 0 ? colors.amber : colors.primary}
                />
              </View>
              <View style={styles.noticeText}>
                <Text style={[styles.resultTitle, { color: colors.text }]}>Hasil terakhir</Text>
                <Text style={[styles.resultMeta, { color: colors.textMuted }]}>
                  {new Date(latest.completedAt).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            <Text style={[styles.resultSummary, { color: colors.text }]}>
              {latest.factors.length > 0
                ? `${latest.factors.length} faktor perlu diperhatikan`
                : 'Tidak ada faktor yang dilaporkan'}
            </Text>

            {latest.factors.map((factor) => (
              <View key={factor} style={styles.listRow}>
                <Icon name="ellipse" size="sm" color={colors.amber} />
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  {SCREENING_FACTOR_LABELS[factor]}
                </Text>
              </View>
            ))}

            {latest.missingChecks.length > 0 ? (
              <View style={[styles.checkBlock, { borderTopColor: colors.borderLight }]}>
                <Text style={[styles.checkTitle, { color: colors.text }]}>Pemeriksaan yang belum diketahui</Text>
                <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
                  {latest.missingChecks.map((check) => SCREENING_CHECK_LABELS[check]).join(', ')}.
                </Text>
              </View>
            ) : null}

            <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
              Hasil ini tidak menentukan diagnosis atau tingkat risiko klinis. Pertimbangkan pemeriksaan berkala di Posbindu, Puskesmas, atau dokter.
            </Text>
          </View>
        ) : null}

        <View style={styles.formHeading}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Kenali faktor Anda</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Jawab sesuai kondisi saat ini.</Text>
          </View>
          <Text style={[styles.counter, { color: colors.primary }]}>
            {answeredCount}/{SCREENING_QUESTIONS.length}
          </Text>
        </View>

        {SCREENING_QUESTIONS.map((question, index) => (
          <View key={question.id} style={[styles.questionCard, { borderColor: colors.border }]}>
            <Text style={[styles.questionNumber, { color: colors.primary }]}>PERTANYAAN {index + 1}</Text>
            <Text style={[styles.questionLabel, { color: colors.text }]}>{question.label}</Text>
            <Text style={[styles.questionHelper, { color: colors.textMuted }]}>{question.helper}</Text>
            <View style={styles.answerRow}>
              {ANSWER_OPTIONS.map((option) => {
                const selected = answers[question.id] === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => chooseAnswer(question.id, option.value)}
                    style={[
                      styles.answerButton,
                      {
                        backgroundColor: selected ? colors.primaryLight : colors.backgroundElement,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[
                      styles.answerLabel,
                      { color: selected ? colors.primaryDark : colors.textSecondary },
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <Button
          label={latest ? 'Simpan hasil baru' : 'Lihat dan simpan hasil'}
          loadingLabel="Menyimpan jawaban..."
          onPress={complete}
          disabled={!canComplete || completeMutation.isPending}
          loading={completeMutation.isPending}
          fullWidth
        />
        <Text style={[styles.version, { color: colors.textMuted }]}>
          Instrumen {SCREENING_INSTRUMENT_VERSION}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeButton: {
    width: 36, height: 36, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.base },
  notice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    borderRadius: BorderRadius.md, padding: Spacing.base,
  },
  noticeText: { flex: 1, gap: 3 },
  noticeTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  noticeBody: { fontSize: FontSize.xs, lineHeight: 18, fontFamily: Fonts.regular },
  resultCard: { borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing.base, gap: Spacing.md },
  resultHeading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  resultIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  resultTitle: { fontSize: FontSize.md, fontFamily: Fonts.bold },
  resultMeta: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  resultSummary: { fontSize: FontSize.lg, fontFamily: Fonts.bold },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  bodyText: { flex: 1, fontSize: FontSize.sm, lineHeight: 20, fontFamily: Fonts.regular },
  checkBlock: { borderTopWidth: 1, paddingTop: Spacing.md, gap: 4 },
  checkTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  disclaimer: { fontSize: FontSize.xs, lineHeight: 18, fontFamily: Fonts.regular },
  formHeading: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    marginTop: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.lg, fontFamily: Fonts.bold },
  sectionSubtitle: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  counter: { fontSize: FontSize.xs, fontFamily: Fonts.bold },
  questionCard: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.base, gap: Spacing.sm },
  questionNumber: { fontSize: 10, letterSpacing: 0.5, fontFamily: Fonts.bold },
  questionLabel: { fontSize: FontSize.sm, lineHeight: 20, fontFamily: Fonts.bold },
  questionHelper: { fontSize: FontSize.xs, lineHeight: 18, fontFamily: Fonts.regular },
  answerRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 2 },
  answerButton: {
    flex: 1, minHeight: 40, borderRadius: BorderRadius.sm, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  answerLabel: { fontSize: FontSize.xs, fontFamily: Fonts.bold, textAlign: 'center' },
  version: { textAlign: 'center', fontSize: 10, fontFamily: Fonts.regular },
});
