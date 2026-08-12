import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle, Platform,
 useColorScheme } from 'react-native';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, nativeReset } from '@/constants/theme';

import { Icon, IconName } from './icon';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  icon?: IconName;
  style?: ViewStyle;
  fullWidth?: boolean;
};

export function Button({
  label, onPress, variant = 'primary', loading, loadingLabel = 'Menyimpan...', disabled, icon, style, fullWidth,
}: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const muted = disabled || loading;

  const bg = isPrimary
    ? colors.primary
    : isSecondary
      ? colors.backgroundElement
      : 'transparent';
  const fg = isPrimary ? colors.onPrimary : colors.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={muted}
      activeOpacity={0.75}
      style={[
        styles.base,
        { backgroundColor: bg, opacity: muted ? 0.55 : 1 },
        isSecondary && { borderWidth: 1, borderColor: colors.border },
        fullWidth && { alignSelf: 'stretch' },
        style,
      ]}
    >
      {loading ? (
        <>
          <ActivityIndicator color={fg} />
          <Text style={[styles.label, { color: fg }]}>{loadingLabel}</Text>
        </>
      ) : (
        <>
          {icon ? <Icon name={icon} size="sm" color={fg} /> : null}
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...(Platform.OS === 'web' ? nativeReset : null),
  },
  label: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.bold,
  } as TextStyle,
});
