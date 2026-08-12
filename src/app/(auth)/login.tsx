import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, Alert, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/services/auth.service';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { Button, TextField, Icon } from '@/components/ui';
import { AppScreen } from '@/components/screen-background';
import { useScreenTopPadding } from '@/hooks/use-screen-top-padding';

export default function LoginScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const topPadding = useScreenTopPadding(Spacing.lg);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Perhatian', 'Email dan password harus diisi');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login(email.trim(), password);
      await setAuth(result.user, result.accessToken, result.refreshToken);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Gagal', err.message ?? 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen style={styles.container}>
      <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topPadding }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={[styles.logo, { backgroundColor: colors.primaryLight }]}>
              <Icon name="leaf-outline" size="lg" color={colors.primary} />
            </View>
            <Text style={[styles.brand, { color: colors.text }]}>Sehatica</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Pantau kesehatan Anda dengan mudah
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Masuk</Text>

            <TextField
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextField
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Masukkan password"
              secureTextEntry={!showPassword}
              secureToggle
              showSecure={showPassword}
              onToggleSecure={() => setShowPassword((v) => !v)}
            />

            <Button label="Masuk" onPress={handleLogin} loading={loading} fullWidth />

            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: colors.border }]} />
              <Text style={[styles.or, { color: colors.textMuted }]}>atau</Text>
              <View style={[styles.line, { backgroundColor: colors.border }]} />
            </View>

            <Button
              label="Belum punya akun? Daftar"
              variant="secondary"
              onPress={() => router.push('/(auth)/register')}
              fullWidth
            />
          </View>

          <Text style={[styles.footer, { color: colors.textMuted }]}>
            Data Anda aman dan terenkripsi
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  header: { alignItems: 'center', gap: Spacing.sm },
  logo: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  brand: { fontSize: FontSize.xxl, fontFamily: Fonts.bold, letterSpacing: -0.6 },
  tagline: { fontSize: FontSize.sm, fontFamily: Fonts.regular },
  form: { gap: Spacing.base },
  formTitle: { fontSize: FontSize.lg, fontFamily: Fonts.bold, marginBottom: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  or: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  footer: { textAlign: 'center', fontSize: FontSize.xs, fontFamily: Fonts.regular },
});
