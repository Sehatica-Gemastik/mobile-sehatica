// Sehatica Design System — Colors, Typography, Spacing
import { Platform } from 'react-native';
export const Colors = {
  light: {
    text: '#171717',
    textSecondary: '#52525B', // zinc-600
    textMuted: '#A1A1AA', // zinc-400
    background: '#FFFFFF',
    backgroundCard: '#FFFFFF',
    backgroundElement: '#F4F4F5', // zinc-100
    backgroundSelected: '#E4E4E7', // zinc-200
    primary: '#171717',
    primaryLight: '#F4F4F5',
    primaryDark: '#0A0A0A',
    primaryGradientStart: '#171717',
    primaryGradientEnd: '#3F3F46',
    border: '#E4E4E7', // zinc-200
    borderLight: '#F4F4F5', // zinc-100
    amber: '#F59E0B',
    amberLight: '#FFFBEB',
    blue: '#3B82F6',
    blueLight: '#EFF6FF',
    red: '#EF4444',
    redLight: '#FEF2F2',
    purple: '#A855F7',
    purpleLight: '#FAF5FF',
    whatsapp: '#25D366',
    shadow: 'rgba(0,0,0,0.04)',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E4E4E7',
    accent: '#0D9488', // teal-600
  },
  dark: {
    text: '#171717',
    textSecondary: '#52525B', 
    textMuted: '#A1A1AA', 
    background: '#FFFFFF',
    backgroundCard: '#FFFFFF',
    backgroundElement: '#F4F4F5',
    backgroundSelected: '#E4E4E7',
    primary: '#171717',
    primaryLight: '#F4F4F5',
    primaryDark: '#0A0A0A',
    primaryGradientStart: '#171717',
    primaryGradientEnd: '#3F3F46',
    border: '#E4E4E7',
    borderLight: '#F4F4F5',
    amber: '#F59E0B',
    amberLight: '#FFFBEB',
    blue: '#3B82F6',
    blueLight: '#EFF6FF',
    red: '#EF4444',
    redLight: '#FEF2F2',
    purple: '#A855F7',
    purpleLight: '#FAF5FF',
    whatsapp: '#25D366',
    shadow: 'rgba(0,0,0,0.04)',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E4E4E7',
    accent: '#0D9488',
  },
} as const;

export type ThemeColors = typeof Colors.light;

export const Fonts = {
  serif: 'PlayfairDisplay_600SemiBold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansBold: 'Inter_700Bold',
} as const;

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
  md: 12, // xl
  lg: 16, // 2xl
  xl: 20, 
  xxl: 24, // 3xl
  xxxl: 32,
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
