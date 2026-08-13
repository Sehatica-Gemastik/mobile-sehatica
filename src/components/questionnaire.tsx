import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, useColorScheme, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, nativeReset } from '@/constants/theme';
import { Button, Icon } from '@/components/ui';
import { AppScreen } from '@/components/screen-background';
import { useScreenTopPadding } from '@/hooks/use-screen-top-padding';
import { ChoiceOption } from '@/features/lifestyle/options';

type ShellProps = {
  progress: number;
  stepLabel: string;
  totalSteps?: number;
  currentStep?: number;
  onBack?: () => void;
  onClose?: () => void;
  children: React.ReactNode;
  footerLabel: string;
  onFooterPress: () => void;
  footerDisabled?: boolean;
  footerLoading?: boolean;
  secondaryFooterLabel?: string;
  onSecondaryFooterPress?: () => void;
};

export function QuestionnaireShell({
  progress,
  stepLabel,
  totalSteps,
  currentStep,
  onBack,
  onClose,
  children,
  footerLabel,
  onFooterPress,
  footerDisabled,
  footerLoading,
  secondaryFooterLabel,
  onSecondaryFooterPress,
}: ShellProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const topPadding = useScreenTopPadding();
  const steps = totalSteps ?? 0;
  const activeStep = currentStep ?? Math.max(1, Math.round(progress * steps));

  return (
    <AppScreen style={styles.shell}>
      <View style={[styles.top, { paddingTop: topPadding }]}>
        <View style={styles.progressRow}>
          {onBack || onClose ? (
            <TouchableOpacity
              accessibilityLabel={onBack ? 'Kembali' : 'Tutup'}
              onPress={onBack ?? onClose}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Icon name={onBack ? 'chevron-back' : 'close'} size="sm" color={colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}

          {steps > 1 ? (
            <View style={styles.segmentRow}>
              {Array.from({ length: steps }, (_, i) => {
                const active = i + 1 <= activeStep;
                return (
                  <View
                    key={i}
                    style={[
                      styles.segment,
                      { backgroundColor: active ? colors.primary : colors.borderLight },
                    ]}
                  />
                );
              })}
            </View>
          ) : (
            <View style={[styles.track, { backgroundColor: colors.borderLight }]}>
              <View
                style={[
                  styles.fill,
                  { backgroundColor: colors.primary, width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` },
                ]}
              />
            </View>
          )}

          <Text style={[styles.stepLabel, { color: colors.textMuted }]}>{stepLabel}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          {secondaryFooterLabel && onSecondaryFooterPress ? (
            <View style={styles.footerRow}>
              <Button
                label={secondaryFooterLabel}
                variant="secondary"
                onPress={onSecondaryFooterPress}
                style={styles.footerHalf}
              />
              <Button
                label={footerLabel}
                onPress={onFooterPress}
                disabled={footerDisabled || footerLoading}
                loading={footerLoading}
                style={styles.footerHalf}
              />
            </View>
          ) : (
            <Button
              label={footerLabel}
              onPress={onFooterPress}
              disabled={footerDisabled || footerLoading}
              loading={footerLoading}
              fullWidth
            />
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

type QuestionCopyProps = {
  kicker?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
};

export function QuestionCopy({ kicker, title, subtitle, centered = true }: QuestionCopyProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <View style={[styles.copy, centered && styles.copyCentered]}>
      {kicker ? (
        <Text style={[styles.kicker, { color: colors.textSecondary }, centered && styles.textCenter]}>{kicker}</Text>
      ) : null}
      <Text style={[styles.title, { color: colors.text }, centered && styles.textCenter]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary }, centered && styles.textCenter]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

type OptionListProps = {
  options: ChoiceOption[];
  value: number | null;
  onChange: (value: number) => void;
  layout?: 'stack' | 'cloud';
};

export function OptionList({ options, value, onChange, layout = 'cloud' }: OptionListProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const useCloud = layout === 'cloud';

  if (useCloud) {
    return (
      <View style={styles.cloudWrap}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              activeOpacity={0.82}
              style={[
                styles.cloudChip,
                {
                  backgroundColor: selected ? colors.primaryLight : colors.backgroundCard,
                  borderColor: selected ? colors.primary : colors.borderLight,
                },
              ]}
            >
              {option.icon ? (
                <Icon name={option.icon} size="sm" color={selected ? colors.primary : colors.textMuted} />
              ) : null}
              <Text style={[styles.cloudLabel, { color: selected ? colors.primaryDark : colors.text }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.stackOptions}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            activeOpacity={0.82}
            style={[
              styles.stackOption,
              {
                backgroundColor: selected ? colors.primaryLight : colors.backgroundCard,
                borderColor: selected ? colors.primary : colors.borderLight,
              },
            ]}
          >
            {option.icon ? (
              <Icon name={option.icon} size="sm" color={selected ? colors.primary : colors.textMuted} />
            ) : null}
            <View style={styles.stackText}>
              <Text style={[styles.stackLabel, { color: selected ? colors.primaryDark : colors.text }]}>
                {option.label}
              </Text>
              {option.hint ? (
                <Text style={[styles.stackHint, { color: colors.textSecondary }]}>{option.hint}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

type ChipRowProps = {
  values: number[];
  selected: number | null;
  onChange: (value: number) => void;
  suffix?: string;
};

export function ChipRow({ values, selected, onChange, suffix }: ChipRowProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <View style={styles.chips}>
      {values.map((item) => {
        const active = selected === item;
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onChange(item)}
            activeOpacity={0.75}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primaryLight : colors.backgroundCard,
                borderColor: active ? colors.primary : colors.borderLight,
              },
            ]}
          >
            <Text style={[styles.chipLabel, { color: active ? colors.primaryDark : colors.textSecondary }]}>
              {item}{suffix ? ` ${suffix}` : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

type BigNumberProps = {
  value: string;
  onChangeText: (text: string) => void;
  unit?: string;
  placeholder?: string;
  maxLength?: number;
};

export function BigNumberField({ value, onChangeText, unit, placeholder, maxLength }: BigNumberProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <View style={[styles.numberWrap, { backgroundColor: colors.backgroundCard, borderColor: colors.borderLight }]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? '0'}
        placeholderTextColor={colors.textMuted}
        keyboardType="decimal-pad"
        maxLength={maxLength ?? 6}
        style={[styles.numberInput, { color: colors.text }]}
        underlineColorAndroid="transparent"
        selectionColor={colors.primary}
        textAlign="left"
      />
      {unit ? <Text style={[styles.unit, { color: colors.textMuted }]}>{unit}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  flex: { flex: 1 },
  top: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: {
    width: 36, height: 36, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  track: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  segmentRow: { flex: 1, flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 4, borderRadius: 999 },
  stepLabel: { fontSize: FontSize.xs, fontFamily: Fonts.medium, minWidth: 52, textAlign: 'right' },
  body: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
    flexGrow: 1,
    alignItems: 'stretch',
  },
  footer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  footerRow: { flexDirection: 'row', gap: 10 },
  footerHalf: { flex: 1 },
  copy: { gap: 6, paddingTop: Spacing.sm },
  copyCentered: { alignItems: 'center' },
  textCenter: { textAlign: 'center' },
  kicker: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  title: { fontSize: FontSize.lg, lineHeight: 26, fontFamily: Fonts.bold },
  subtitle: { fontSize: FontSize.sm, lineHeight: 20, fontFamily: Fonts.regular, maxWidth: 340 },
  cloudWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  cloudChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: '100%',
  },
  cloudLabel: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
  stackOptions: { gap: 8, width: '100%' },
  stackOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingVertical: 12,
    paddingHorizontal: Spacing.base,
  },
  stackText: { flex: 1, gap: 2 },
  stackLabel: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
  stackHint: { fontSize: FontSize.xs, lineHeight: 18, fontFamily: Fonts.regular },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipLabel: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
  numberWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 13 : 11,
  },
  numberInput: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: Fonts.regular,
    minHeight: 22,
    padding: 0,
    ...(Platform.OS === 'web' ? nativeReset : null),
  },
  unit: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
});
