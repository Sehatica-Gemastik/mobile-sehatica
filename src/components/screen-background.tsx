import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientColors } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function ScreenBackground({ children, style }: Props) {
  return (
    <LinearGradient
      colors={[GradientColors.start, GradientColors.middle, GradientColors.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.fill, style]}
    >
      {children}
    </LinearGradient>
  );
}

export function AppScreen({ children, style }: Props) {
  return (
    <View style={[styles.fill, style]}>
      <LinearGradient
        colors={[GradientColors.start, GradientColors.middle, GradientColors.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
