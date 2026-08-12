import React from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { AppScreen } from '@/components/screen-background';

export default function OnboardingLayout() {
  return (
    <AppScreen style={styles.root}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade', gestureEnabled: false }}>
        <Stack.Screen name="identity" />
      </Stack>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
