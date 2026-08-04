// Sehatica Design System — Colors, Typography, Spacing

export const Colors = {
  light: {
    text: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    background: '#F9FAFB',
    backgroundCard: '#FFFFFF',
    backgroundElement: '#F3F4F6',
    backgroundSelected: '#DCFCE7',
    primary: '#16A34A',
    primaryLight: '#DCFCE7',
    primaryDark: '#15803D',
    primaryGradientStart: '#16A34A',
    primaryGradientEnd: '#4ADE80',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    amber: '#F59E0B',
    amberLight: '#FFFBEB',
    blue: '#3B82F6',
    blueLight: '#EFF6FF',
    red: '#EF4444',
    redLight: '#FEF2F2',
    purple: '#A855F7',
    purpleLight: '#FAF5FF',
    whatsapp: '#25D366',
    shadow: 'rgba(0,0,0,0.06)',
    tabBar: '#FFFFFF',
    tabBarBorder: '#F3F4F6',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    background: '#111827',
    backgroundCard: '#1F2937',
    backgroundElement: '#374151',
    backgroundSelected: '#052e16',
    primary: '#16A34A',
    primaryLight: '#052e16',
    primaryDark: '#15803D',
    primaryGradientStart: '#16A34A',
    primaryGradientEnd: '#4ADE80',
    border: '#374151',
    borderLight: '#1F2937',
    amber: '#F59E0B',
    amberLight: '#1c1400',
    blue: '#3B82F6',
    blueLight: '#0c1a35',
    red: '#EF4444',
    redLight: '#1a0000',
    purple: '#A855F7',
    purpleLight: '#1a0035',
    whatsapp: '#25D366',
    shadow: 'rgba(0,0,0,0.3)',
    tabBar: '#1F2937',
    tabBarBorder: '#374151',
  },
} as const;

export type ThemeColors = typeof Colors.light;

import { Platform } from 'react-native';

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    rounded: 'ui-rounded',
    mono: 'Courier',
  },
  default: {
    sans: 'normal',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
