import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, useColorScheme, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Fonts, FontSize, Spacing, ThemeColors } from '@/constants/theme';
import { useScreenTopPadding } from '@/hooks/use-screen-top-padding';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children?: ReactNode;
  bordered?: boolean;
  /** White header with rounded bottom corners (default on) */
  surface?: boolean;
  style?: ViewStyle;
};

export function surfaceHeaderShell(colors: ThemeColors, extra?: ViewStyle): ViewStyle {
  return {
    backgroundColor: colors.backgroundCard,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
    paddingBottom: Spacing.lg,
    ...extra,
  };
}

export function ScreenHeader({
  title, subtitle, right, children, bordered = false, surface = true, style,
}: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const topPadding = useScreenTopPadding();

  return (
    <View
      style={[
        styles.wrap,
        { paddingTop: topPadding },
        surface && surfaceHeaderShell(colors),
        bordered && !surface && {
          borderBottomColor: colors.borderLight,
          borderBottomWidth: StyleSheet.hairlineWidth,
          paddingBottom: Spacing.md,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: 'transparent' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  textBlock: { flex: 1, gap: 2 },
  title: { fontSize: FontSize.xl, fontFamily: Fonts.bold, letterSpacing: -0.5 },
  subtitle: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
});
