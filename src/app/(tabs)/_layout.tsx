import React, { useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Slot } from 'expo-router';
import { BottomTabBar } from '@/components/app-tabs';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Slot />
      </View>
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
