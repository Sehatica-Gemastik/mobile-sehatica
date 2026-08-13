import React from 'react';
import { StyleSheet } from 'react-native';
import { Slot, useSegments } from 'expo-router';
import { BottomTabBar } from '@/components/app-tabs';
import { AppScreen } from '@/components/screen-background';
import { HealyWidget } from '@/components/mascot';

export default function TabsLayout() {
  const segments = useSegments();
  const tab = segments[1];
  const isDashboard = !tab;

  return (
    <AppScreen style={styles.container} gradient={isDashboard ? 'healy' : 'default'}>
      <Slot />
      <HealyWidget />
      <BottomTabBar />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'visible' },
});
