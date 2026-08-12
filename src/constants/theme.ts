import { Platform, ViewStyle } from 'react-native';

/**
 * Sehatica design tokens — clean SaaS (see DESIGN_SYSTEM.md)
 *
 * Canvas: mint-teal → peach gradient (GradientColors)
 * Surfaces: white cards (backgroundCard) + Shadows.sm
 * Type: Inter 400/500/600/700
 * Primary: #00A7B1 teal
 */
export const Colors = {
  light: {
    text: '#1A2332',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    background: 'transparent',
    backgroundCard: '#FFFFFF',
    backgroundElement: '#F4F7F8',
    backgroundSelected: '#E0F7FA',
    primary: '#00A7B1',
    primaryLight: '#E0F7FA',
    primaryDark: '#008A93',
    primaryMuted: '#B2EBF2',
    onPrimary: '#FFFFFF',
    border: 'rgba(0, 167, 177, 0.12)',
    borderLight: 'rgba(148, 163, 184, 0.2)',
    amber: '#D97706',
    amberLight: '#FFFBEB',
    blue: '#2563EB',
    blueLight: '#EFF6FF',
    red: '#DC2626',
    redLight: '#FEF2F2',
    whatsapp: '#25D366',
    shadow: 'rgba(0, 120, 130, 0.06)',
    tabBar: '#FFFFFF',
    tabBarBorder: 'rgba(0, 167, 177, 0.08)',
    accent: '#00A7B1',
  },
  dark: {
    text: '#1A2332',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    background: 'transparent',
    backgroundCard: '#FFFFFF',
    backgroundElement: '#F4F7F8',
    backgroundSelected: '#E0F7FA',
    primary: '#00A7B1',
    primaryLight: '#E0F7FA',
    primaryDark: '#008A93',
    primaryMuted: '#B2EBF2',
    onPrimary: '#FFFFFF',
    border: 'rgba(0, 167, 177, 0.12)',
    borderLight: 'rgba(148, 163, 184, 0.2)',
    amber: '#D97706',
    amberLight: '#FFFBEB',
    blue: '#2563EB',
    blueLight: '#EFF6FF',
    red: '#DC2626',
    redLight: '#FEF2F2',
    whatsapp: '#25D366',
    shadow: 'rgba(0, 120, 130, 0.06)',
    tabBar: '#FFFFFF',
    tabBarBorder: 'rgba(0, 167, 177, 0.08)',
    accent: '#00A7B1',
  },
} as const;

export const GradientColors = {
  start: '#DDF5F3',
  middle: '#EEF9F8',
  end: '#FFF0EB',
} as const;

export type ThemeColors = typeof Colors.light;
export type ThemeColor = keyof ThemeColors;

export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
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
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  full: 9999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export const IconSize = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

export type IconSizeToken = keyof typeof IconSize;

export const Shadows = {
  none: {} as ViewStyle,
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#007882',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
    },
    android: { elevation: 2 },
    default: {},
  }) ?? {},
  md: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#007882',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
    },
    android: { elevation: 3 },
    default: {},
  }) ?? {},
  stack: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 14,
    },
    android: { elevation: 5 },
    default: {},
  }) ?? {},
} as const;

/** Shadow for overlapping stack cards — front only when stacked; none when expanded */
export function stackCardShadow(expanded: boolean, stackIndex: number): ViewStyle {
  if (expanded || stackIndex > 0) return Shadows.none;
  return Shadows.sm;
}

/** Fade cards behind the front card in stack mode */
export function stackLayerOpacity(expanded: boolean, stackIndex: number): number {
  if (expanded || stackIndex === 0) return 1;
  return Math.max(0.38, 1 - stackIndex * 0.32);
}

export const nativeReset = Platform.select({
  web: {
    outlineWidth: 0,
    boxShadow: 'none',
  } as const,
  default: {},
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
