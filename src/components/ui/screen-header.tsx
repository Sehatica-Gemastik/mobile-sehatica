import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, FontSize, Spacing } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children?: ReactNode;
  bordered?: boolean;
};

export function ScreenHeader({ title, subtitle, right, children, bordered = true }: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.wrap,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          borderBottomWidth: bordered ? StyleSheet.hairlineWidth : 0,
        },
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  textBlock: { flex: 1, gap: 2 },
  title: { fontSize: FontSize.xl, fontFamily: Fonts.bold, letterSpacing: -0.4 },
  subtitle: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
});
