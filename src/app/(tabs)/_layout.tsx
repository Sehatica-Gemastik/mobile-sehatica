import React from 'react';
import { StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { BottomTabBar } from '@/components/app-tabs';
import { AppScreen } from '@/components/screen-background';

export default function TabsLayout() {
  return (
    <AppScreen style={styles.container}>
      <Slot />
      <BottomTabBar />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
