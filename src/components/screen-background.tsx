import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientColors, HealyGradientColors } from '@/constants/theme';

type GradientPreset = 'default' | 'healy';

type GradientConfig = {
  colors: readonly [string, string, string];
  start: { x: number; y: number };
  end: { x: number; y: number };
};

const GRADIENT_PRESETS: Record<GradientPreset, GradientConfig> = {
  default: {
    colors: [GradientColors.start, GradientColors.middle, GradientColors.end],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  healy: {
    colors: [HealyGradientColors.start, HealyGradientColors.middle, HealyGradientColors.end],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
};

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: GradientPreset;
};

function gradientConfig(preset: GradientPreset = 'default') {
  return GRADIENT_PRESETS[preset];
}

export function ScreenBackground({ children, style, gradient = 'default' }: Props) {
  const config = gradientConfig(gradient);
  return (
    <LinearGradient
      colors={[...config.colors]}
      start={config.start}
      end={config.end}
      style={[styles.fill, style]}
    >
      {children}
    </LinearGradient>
  );
}

export function AppScreen({ children, style, gradient = 'default' }: Props) {
  const config = gradientConfig(gradient);
  return (
    <View style={[styles.fill, style]}>
      <LinearGradient
        colors={[...config.colors]}
        start={config.start}
        end={config.end}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
