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
  onBack?: () => void;
  children: React.ReactNode;
  footerLabel: string;
  onFooterPress: () => void;
  footerDisabled?: boolean;
  footerLoading?: boolean;
};

export function QuestionnaireShell({
  progress,
  stepLabel,
  onBack,
  children,
  footerLabel,
  onFooterPress,
  footerDisabled,
  footerLoading,
}: ShellProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const topPadding = useScreenTopPadding();

  return (
    <AppScreen style={styles.shell}>
      <View style={[styles.top, { paddingTop: topPadding }]}>
        <View style={styles.progressRow}>
          {onBack ? (
            <TouchableOpacity
              accessibilityLabel="Kembali"
              onPress={onBack}
              style={[styles.backBtn, { backgroundColor: colors.backgroundElement }]}
              activeOpacity={0.7}
            >
              <Icon name="chevron-back" size="sm" color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          <View style={[styles.track, { backgroundColor: colors.borderLight }]}>
            <View
              style={[
                styles.fill,
                { backgroundColor: colors.primary, width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` },
              ]}
            />
          </View>
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
          <Button
            label={footerLabel}
            onPress={onFooterPress}
            disabled={footerDisabled || footerLoading}
            loading={footerLoading}
            fullWidth
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

type QuestionCopyProps = {
  kicker?: string;
  title: string;
  subtitle?: string;
};

export function QuestionCopy({ kicker, title, subtitle }: QuestionCopyProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <View style={styles.copy}>
      {kicker ? (
        <Text style={[styles.kicker, { color: colors.primary }]}>{kicker}</Text>
      ) : null}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

type OptionListProps = {
  options: ChoiceOption[];
  value: number | null;
  onChange: (value: number) => void;
};

export function OptionList({ options, value, onChange }: OptionListProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <View style={styles.options}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}
            style={[
              styles.option,
              {
                backgroundColor: selected ? colors.primaryLight : colors.backgroundElement,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, { color: selected ? colors.primaryDark : colors.text }]}>
                {option.label}
              </Text>
              {option.hint ? (
                <Text style={[styles.optionHint, { color: colors.textSecondary }]}>{option.hint}</Text>
              ) : null}
            </View>
            <View
              style={[
                styles.radio,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primary : 'transparent',
                },
              ]}
            >
              {selected ? <Icon name="checkmark" size="sm" color={colors.onPrimary} /> : null}
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
              { backgroundColor: active ? colors.primary : colors.backgroundElement },
            ]}
          >
            <Text style={[styles.chipLabel, { color: active ? colors.onPrimary : colors.textSecondary }]}>
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
    <View style={[styles.numberWrap, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
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
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  stepLabel: { fontSize: FontSize.xs, fontFamily: Fonts.medium, minWidth: 52, textAlign: 'right' },
  body: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.xl, flexGrow: 1 },
  footer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  copy: { gap: 8, paddingTop: Spacing.md },
  kicker: {
    fontSize: 11, fontFamily: Fonts.bold, letterSpacing: 0.6, textTransform: 'uppercase',
  },
  title: { fontSize: 26, lineHeight: 32, fontFamily: Fonts.bold, letterSpacing: -0.6 },
  subtitle: { fontSize: FontSize.sm, lineHeight: 20, fontFamily: Fonts.regular },
  options: { gap: 10 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderRadius: BorderRadius.lg, padding: Spacing.base,
  },
  optionText: { flex: 1, gap: 2 },
  optionLabel: { fontSize: FontSize.md, fontFamily: Fonts.bold },
  optionHint: { fontSize: FontSize.xs, lineHeight: 18, fontFamily: Fonts.regular },
  radio: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: BorderRadius.full,
  },
  chipLabel: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
  numberWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg, minHeight: 72,
  },
  numberInput: {
    flex: 1, fontSize: 32, fontFamily: Fonts.bold, padding: 0,
    ...(Platform.OS === 'web' ? nativeReset : null),
  },
  unit: { fontSize: FontSize.md, fontFamily: Fonts.medium },
});
