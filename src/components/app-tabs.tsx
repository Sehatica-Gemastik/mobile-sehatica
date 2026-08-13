import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useSegments } from 'expo-router';
import { Colors, Fonts, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui';

type Tab = {
  name: string;
  icon: IconName;
  label: string;
  route: string;
};

const TABS: Tab[] = [
  { name: 'home', icon: 'home-outline', label: 'Beranda', route: '/(tabs)/' },
  { name: 'records', icon: 'clipboard-outline', label: 'Rekam', route: '/(tabs)/records' },
  { name: 'schedule', icon: 'calendar-outline', label: 'Jadwal', route: '/(tabs)/schedule' },
  { name: 'doctor', icon: 'medkit-outline', label: 'Dokter', route: '/(tabs)/doctor' },
];

export function BottomTabBar() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const currentRoute = '/' + segments.join('/');

  const isActive = (tab: Tab) =>
    currentRoute.includes(tab.name)
    || (tab.name === 'home' && (currentRoute === '/(tabs)' || currentRoute.endsWith('/(tabs)/')));

  return (
    <View style={[styles.bar, Shadows.sm, { backgroundColor: colors.tabBar, paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((tab) => {
        const active = isActive(tab);
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => router.push(tab.route as any)}
            style={styles.tab}
            activeOpacity={0.75}
          >
            {active ? (
              <View style={[styles.activeLine, { backgroundColor: colors.primary }]} />
            ) : (
              <View style={styles.activeLinePlaceholder} />
            )}
            <Icon
              name={tab.icon}
              size="md"
              color={active ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: active ? colors.primary : colors.textMuted },
                active && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingHorizontal: 6,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 167, 177, 0.08)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
  },
  activeLine: {
    width: 28,
    height: 3,
    borderRadius: 2,
    marginBottom: 2,
  },
  activeLinePlaceholder: {
    width: 28,
    height: 3,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
  },
  tabLabelActive: {
    fontFamily: Fonts.bold,
  },
});
