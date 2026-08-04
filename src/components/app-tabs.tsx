import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, useColorScheme,
  Platform, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useSegments } from 'expo-router';
import { Colors, FontSize, BorderRadius } from '@/constants/theme';
import { HeallyFAB } from './heally-fab';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Tab {
  name: string;
  icon: string;
  label: string;
  route: string;
}

const TABS: Tab[] = [
  { name: 'home', icon: '🏠', label: 'Beranda', route: '/(tabs)/' },
  { name: 'records', icon: '📋', label: 'Rekam', route: '/(tabs)/records' },
  { name: 'heally', icon: '', label: 'Heally', route: '/(tabs)/heally' }, // FAB slot
  { name: 'schedule', icon: '📅', label: 'Jadwal', route: '/(tabs)/schedule' },
  { name: 'doctor', icon: '👨‍⚕️', label: 'Dokter', route: '/(tabs)/doctor' },
];

export function BottomTabBar() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  const currentRoute = '/' + segments.join('/');

  const isActive = (tab: Tab) => {
    if (tab.name === 'heally') return currentRoute.includes('heally');
    return currentRoute.includes(tab.name) || (tab.name === 'home' && currentRoute === '/(tabs)');
  };

  const handleTabPress = (tab: Tab) => {
    if (tab.name === 'heally') {
      router.push('/(tabs)/heally');
      return;
    }
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
            <View
              style={[
                styles.iconWrapper,
                active && { backgroundColor: colors.primaryLight },
              ]}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  iconWrapper: {
    width: 44,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    marginTop: -12, // Lift the FAB above the tab bar
  },
  fabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
