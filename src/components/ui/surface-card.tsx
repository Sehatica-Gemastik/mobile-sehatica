import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  shadow?: keyof typeof Shadows;
};

export function SurfaceCard({ children, style, padded = true, shadow = 'sm' }: Props) {
  const colors = Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];

  return (
    <View
      style={[
        Shadows[shadow],
        styles.card,
        { backgroundColor: colors.backgroundCard },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  padded: {
    padding: Spacing.base,
  },
});
