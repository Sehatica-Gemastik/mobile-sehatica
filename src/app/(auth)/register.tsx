import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, Alert, useColorScheme, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/services/auth.service';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { Button, TextField, Icon } from '@/components/ui';

export default function RegisterScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Perhatian', 'Nama, email, dan password harus diisi');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Perhatian', 'Format email tidak valid');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Perhatian', 'Password minimal 8 karakter');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      await setAuth(result.user, result.accessToken, result.refreshToken);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Registrasi Gagal', err.message ?? 'Gagal membuat akun');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={[styles.logo, { backgroundColor: colors.primaryLight }]}>
              <Icon name="leaf-outline" size="lg" color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Buat akun</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Mulai perjalanan kesehatan bersama Heally
            </Text>
          </View>

          <View style={styles.form}>
            <TextField
              label="Nama lengkap"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              placeholder="Nama Anda"
              autoCapitalize="words"
              maxLength={255}
            />
            <TextField
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              maxLength={255}
            />
            <TextField
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 8 karakter"
              secureTextEntry={!showPassword}
              secureToggle
              showSecure={showPassword}
              onToggleSecure={() => setShowPassword((v) => !v)}
              autoComplete="new-password"
              maxLength={128}
            />
            <TextField
              label="Nomor telepon (opsional)"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              placeholder="+62812xxxxx"
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={20}
            />

            <View style={[styles.hint, { backgroundColor: colors.primaryLight }]}>
              <Icon name="information-circle-outline" size="sm" color={colors.primary} />
              <Text style={[styles.hintText, { color: colors.primaryDark }]}>
                Data kesehatan Anda tetap disimpan secara lokal di perangkat.
              </Text>
            </View>

            <Button label="Daftar" onPress={handleRegister} loading={loading} fullWidth />
          </View>

          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.back}>
            <Text style={[styles.backText, { color: colors.textSecondary }]}>
              Sudah punya akun?{' '}
              <Text style={{ color: colors.primary, fontFamily: Fonts.bold }}>Masuk</Text>
            </Text>
          </TouchableOpacity>
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
  },
  title: { fontSize: FontSize.xl, fontFamily: Fonts.bold, letterSpacing: -0.4 },
  subtitle: { fontSize: FontSize.sm, fontFamily: Fonts.regular, textAlign: 'center' },
  form: { gap: Spacing.base },
  hint: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'flex-start',
  },
  hintText: { fontSize: FontSize.xs, lineHeight: 17, flex: 1, fontFamily: Fonts.regular },
  back: { alignItems: 'center' },
  backText: { fontSize: FontSize.sm, fontFamily: Fonts.regular },
});
