// Sehatica design — white / gray / green (Hallo-inspired minimal)
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#18181B',
    textSecondary: '#52525B',
    textMuted: '#A1A1AA',
    background: '#FFFFFF',
    backgroundCard: '#FFFFFF',
    backgroundElement: '#F4F4F5',
    backgroundSelected: '#E4E4E7',
    primary: '#16A34A',
    primaryLight: '#F0FDF4',
    primaryDark: '#15803D',
    primaryMuted: '#86EFAC',
    onPrimary: '#FFFFFF',
    border: '#E4E4E7',
    borderLight: '#F4F4F5',
    amber: '#D97706',
    amberLight: '#FFFBEB',
    blue: '#2563EB',
    blueLight: '#EFF6FF',
    red: '#DC2626',
    redLight: '#FEF2F2',
    whatsapp: '#25D366',
    shadow: 'rgba(0,0,0,0.04)',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E4E4E7',
    accent: '#16A34A',
  },
  dark: {
    text: '#18181B',
    textSecondary: '#52525B',
    textMuted: '#A1A1AA',
    background: '#FFFFFF',
    backgroundCard: '#FFFFFF',
    backgroundElement: '#F4F4F5',
    backgroundSelected: '#E4E4E7',
    primary: '#16A34A',
    primaryLight: '#F0FDF4',
    primaryDark: '#15803D',
    primaryMuted: '#86EFAC',
    onPrimary: '#FFFFFF',
    border: '#E4E4E7',
    borderLight: '#F4F4F5',
    amber: '#D97706',
    amberLight: '#FFFBEB',
    blue: '#2563EB',
    blueLight: '#EFF6FF',
    red: '#DC2626',
    redLight: '#FEF2F2',
    whatsapp: '#25D366',
    shadow: 'rgba(0,0,0,0.04)',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E4E4E7',
    accent: '#16A34A',
  },
} as const;

export type ThemeColors = typeof Colors.light;

export const Fonts = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
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
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
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

/** fixed icon sizes — do not pass raw numbers in screens */
export const IconSize = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

export type IconSizeToken = keyof typeof IconSize;

/** kill native focus ring / underline on web + android */
export const nativeReset = Platform.select({
  web: {
    outlineWidth: 0,
    boxShadow: 'none',
  } as const,
  default: {},
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
