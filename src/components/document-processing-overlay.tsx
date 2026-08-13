import React, { useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing, useColorScheme, ActivityIndicator,
} from 'react-native';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui';

export type DocumentProcessingPhase = 'saving' | 'reading' | 'parsing' | 'finishing';
export type DocumentProcessingKind = 'pdf' | 'photo';

export type DocumentProcessingState = {
  phase: DocumentProcessingPhase;
  kind: DocumentProcessingKind;
  fileName?: string;
};

type StepDef = { phase: DocumentProcessingPhase; label: string; icon: IconName };

const PDF_STEPS: StepDef[] = [
  { phase: 'saving', label: 'Menyimpan PDF ke perangkat', icon: 'cloud-upload-outline' },
  { phase: 'reading', label: 'Mengekstrak teks dari PDF', icon: 'document-text-outline' },
  { phase: 'parsing', label: 'Menganalisis isi dengan AI', icon: 'sparkles-outline' },
  { phase: 'finishing', label: 'Menyusun format rekam medis standar', icon: 'checkmark-circle-outline' },
];

const PHOTO_STEPS: StepDef[] = [
  { phase: 'saving', label: 'Menyimpan foto ke perangkat', icon: 'cloud-upload-outline' },
  { phase: 'reading', label: 'Membaca gambar dokumen', icon: 'scan-outline' },
  { phase: 'parsing', label: 'Vision AI sedang memparse', icon: 'sparkles-outline' },
  { phase: 'finishing', label: 'Menyusun format rekam medis standar', icon: 'checkmark-circle-outline' },
];

const PHASE_ORDER: DocumentProcessingPhase[] = ['saving', 'reading', 'parsing', 'finishing'];

function phaseIndex(phase: DocumentProcessingPhase): number {
  return PHASE_ORDER.indexOf(phase);
}

interface DocumentProcessingOverlayProps {
  state: DocumentProcessingState | null;
}

export function DocumentProcessingOverlay({ state }: DocumentProcessingOverlayProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const pulse = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  const steps = state?.kind === 'pdf' ? PDF_STEPS : PHOTO_STEPS;
  const activeIdx = state ? Math.max(0, phaseIndex(state.phase)) : 0;
  const activeStep = steps[activeIdx] ?? steps[0];
  const isOpeningPicker = state?.fileName?.startsWith('Membuka pemilih');

  const progressRatio = useMemo(() => {
    if (!state) return 0;
    if (isOpeningPicker) return 0.12;
    return (activeIdx + 1) / steps.length;
  }, [activeIdx, isOpeningPicker, state, steps.length]);

  useEffect(() => {
    if (!state) return undefined;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [state, pulse]);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: progressRatio,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressRatio, progress]);

  if (!state) return null;

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });
  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.root} pointerEvents="auto">
      <View style={styles.backdrop}>
        <View style={[styles.card, Shadows.md, { backgroundColor: colors.backgroundCard }]}>
          <View style={styles.hero}>
            <Animated.View
              style={[
                styles.glow,
                {
                  backgroundColor: colors.primaryLight,
                  opacity: glowOpacity,
                  transform: [{ scale }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.primary, transform: [{ scale }] },
              ]}
            >
              {isOpeningPicker ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Icon name={activeStep.icon} size="lg" color={colors.onPrimary} />
              )}
            </Animated.View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {isOpeningPicker
              ? 'Membuka pemilih file'
              : state.kind === 'pdf'
                ? 'Memproses PDF'
                : 'Memproses foto dokumen'}
          </Text>
          {state.fileName ? (
            <Text style={[styles.fileName, { color: colors.textMuted }]} numberOfLines={1}>
              {state.fileName}
            </Text>
          ) : null}
          <Text style={[styles.activeStep, { color: colors.textSecondary }]}>
            {isOpeningPicker ? 'Silakan pilih dokumen…' : `${activeStep.label}…`}
          </Text>

          <View style={[styles.progressTrack, { backgroundColor: colors.backgroundElement }]}>
            <Animated.View style={[styles.progressFill, { backgroundColor: colors.primary, width: barWidth }]} />
          </View>

          {!isOpeningPicker ? (
            <View style={styles.steps}>
              {steps.map((step, idx) => {
                const done = idx < activeIdx;
                const active = idx === activeIdx;
                return (
                  <View key={step.phase} style={styles.stepRow}>
                    <View
                      style={[
                        styles.stepDot,
                        {
                          backgroundColor: done ? colors.primary : active ? colors.primaryLight : colors.backgroundElement,
                          borderColor: active || done ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      {done ? (
                        <Icon name="checkmark" size="sm" color={colors.onPrimary} />
                      ) : active ? (
                        <View style={[styles.stepPulse, { backgroundColor: colors.primary }]} />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        {
                          color: active ? colors.text : done ? colors.textSecondary : colors.textMuted,
                          fontFamily: active ? Fonts.medium : Fonts.regular,
                        },
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          <Text style={[styles.hint, { color: colors.textMuted }]}>
            {isOpeningPicker
              ? 'Jangan tutup aplikasi'
              : 'Mohon tunggu — dokumen diparse ke format rekam medis standar'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  hero: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  glow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.bold,
    textAlign: 'center',
  },
  fileName: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    maxWidth: '100%',
  },
  activeStep: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.medium,
    textAlign: 'center',
    marginTop: 2,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  steps: {
    width: '100%',
    gap: 10,
    marginTop: Spacing.base,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepLabel: {
    flex: 1,
    fontSize: FontSize.xs,
  },
  hint: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
});
