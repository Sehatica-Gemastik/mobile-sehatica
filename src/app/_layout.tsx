import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/store/auth-store';
import { useHeallyAskSync } from '@/hooks/use-heally-ask-sync';
import { useHeallyStore } from '@/store/heally-store';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

if (Platform.OS === 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../global.css');
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, loadStoredAuth, user } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const previousUserId = useRef<number | null>(null);

  useHeallyAskSync();

  useEffect(() => {
    loadStoredAuth().then(() => {
      SplashScreen.hideAsync();
    });
  }, [loadStoredAuth]);

  useEffect(() => {
    const userId = user?.id ?? null;
    if (previousUserId.current !== userId) {
      queryClient.clear();
      useHeallyStore.getState().reset();
      previousUserId.current = userId;
    }
  }, [user?.id]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, router, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="record/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
          </Stack>
        </AuthGuard>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
