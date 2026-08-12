import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/store/auth-store';
import { useLifestyleStore } from '@/store/lifestyle-store';
import { useRdsaSync } from '@/hooks/use-rdsa-sync';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

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
  const identityCompleted = useLifestyleStore((state) => Boolean(state.identity));
  const lifestyleLoading = useLifestyleStore((state) => state.isLoading);
  const loadProfile = useLifestyleStore((state) => state.loadProfile);
  const router = useRouter();
  const segments = useSegments();
  const previousUserId = useRef<number | null>(null);

  useRdsaSync();

  useEffect(() => {
    Promise.all([loadStoredAuth(), loadProfile()]).then(() => {
      SplashScreen.hideAsync();
    });
  }, [loadStoredAuth, loadProfile]);

  useEffect(() => {
    const userId = user?.id ?? null;
    if (previousUserId.current !== userId) {
      queryClient.clear();
      previousUserId.current = userId;
    }
  }, [user?.id]);

  useEffect(() => {
    if (isLoading || lifestyleLoading) return;

    const group = segments[0];
    const inAuthGroup = group === '(auth)';
    const inOnboarding = group === '(onboarding)';

    if (!identityCompleted) {
      if (!inOnboarding) router.replace('/(onboarding)/identity');
      return;
    }

    if (!isAuthenticated) {
      if (!inAuthGroup) router.replace('/(auth)/login');
      return;
    }

    if (inAuthGroup || inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [identityCompleted, isAuthenticated, isLoading, lifestyleLoading, router, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="weekly-checkin" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="daily-checkin" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="record/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="account" options={{ headerShown: false, animation: 'slide_from_right' }} />
          </Stack>
        </AuthGuard>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
