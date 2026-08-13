import { Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '@/constants/theme';

const MIN_INSET = Platform.select({
  ios: 14,
  android: 0,
  web: 24,
  default: 12,
}) ?? 12;

/** Reliable top inset — fixes Android/web where SafeAreaView top is often 0 */
export function useScreenTopPadding(extra: number = Spacing.lg) {
  const insets = useSafeAreaInsets();
  const statusBar = Platform.OS === 'android' ? StatusBar.currentHeight ?? 28 : 0;
  return Math.max(insets.top, statusBar, MIN_INSET) + extra;
}
