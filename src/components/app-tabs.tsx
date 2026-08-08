import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useSegments } from 'expo-router';
import { Colors, Fonts, FontSize, BorderRadius } from '@/constants/theme';
import { HeallyFAB } from './heally-fab';
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
  { name: 'heally', icon: 'sparkles-outline', label: 'Heally', route: '/(tabs)/heally' },
  { name: 'schedule', icon: 'calendar-outline', label: 'Jadwal', route: '/(tabs)/schedule' },
  { name: 'doctor', icon: 'medkit-outline', label: 'Dokter', route: '/(tabs)/doctor' },
];

export function BottomTabBar() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const currentRoute = '/' + segments.join('/');

  const isActive = (tab: Tab) => {
    if (tab.name === 'heally') return currentRoute.includes('heally');
    return currentRoute.includes(tab.name) || (tab.name === 'home' && (currentRoute === '/(tabs)' || currentRoute.endsWith('/(tabs)/')));
  };

  const handleTabPress = (tab: Tab) => {
    router.push(tab.route as any);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        },
      ]}
    >
      {TABS.map((tab) => {
        const active = isActive(tab);

        if (tab.name === 'heally') {
          return (
            <View key="heally" style={styles.fabContainer}>
              <HeallyFAB isOpen={active} onPress={() => handleTabPress(tab)} />
              <Text style={[styles.fabLabel, { color: active ? colors.primary : colors.textMuted }]}>
                Heally
              </Text>
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => handleTabPress(tab)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, active && { backgroundColor: colors.primaryLight }]}>
              <Icon
                name={tab.icon}
                size="md"
                color={active ? colors.primary : colors.textMuted}
              />
            </View>
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
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  iconWrapper: {
    width: 44,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  tabLabelActive: { fontFamily: Fonts.bold },
  fabContainer: { flex: 1, alignItems: 'center', gap: 4, marginTop: -12 },
  fabLabel: { fontSize: FontSize.xs, fontFamily: Fonts.bold },
});
