import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/services/auth.service';
import { Colors, FontSize, BorderRadius, Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

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
      router.replace('/(tabs)/');
    } catch (err: any) {
      Alert.alert('Login Gagal', err.message ?? 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.logoEmoji}>🌿</Text>
            </View>
            <Text style={[styles.appName, { color: colors.primary }]}>Sehatica</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Asisten Kesehatan Cerdas Anda
            </Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Masuk</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Selamat datang kembali 👋
            </Text>

            {/* Email field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="nama@email.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password field */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Masukkan password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[styles.loginBtn, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginBtnText}>Masuk</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>atau</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Register link */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={[styles.registerBtn, { borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.registerBtnText, { color: colors.text }]}>
                Belum punya akun?{' '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>Daftar</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              🔒 Data Anda aman dan terenkripsi
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: FontSize.xxl, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: FontSize.sm, textAlign: 'center' },
  card: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    gap: Spacing.base,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: { fontSize: FontSize.xl, fontWeight: '800' },
  cardSubtitle: { fontSize: FontSize.sm, marginBottom: 4 },
  fieldGroup: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: FontSize.sm, minHeight: 22 },
  loginBtn: {
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: { color: 'white', fontSize: FontSize.md, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: FontSize.xs },
  registerBtn: {
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  registerBtnText: { fontSize: FontSize.sm },
  footer: { alignItems: 'center' },
  footerText: { fontSize: FontSize.xs },
});
