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

export default function RegisterScreen() {
  const scheme = useColorScheme() ?? 'light';
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
    if (password.length < 6) {
      Alert.alert('Perhatian', 'Password minimal 6 karakter');
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
      router.replace('/(tabs)/');
    } catch (err: any) {
      Alert.alert('Registrasi Gagal', err.message ?? 'Gagal membuat akun');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Nama Lengkap', icon: '👤', value: name, setter: setName, placeholder: 'Nama Anda', keyboard: 'default' as const, secure: false },
    { key: 'email', label: 'Email', icon: '📧', value: email, setter: setEmail, placeholder: 'nama@email.com', keyboard: 'email-address' as const, secure: false },
    { key: 'password', label: 'Password', icon: '🔒', value: password, setter: setPassword, placeholder: 'Min. 6 karakter', keyboard: 'default' as const, secure: true },
    { key: 'phone', label: 'Nomor Telepon (opsional)', icon: '📱', value: phone, setter: setPhone, placeholder: '+62812xxxxx', keyboard: 'phone-pad' as const, secure: false },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.logoEmoji}>🌿</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Buat Akun Baru</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Mulai perjalanan kesehatan Anda bersama Heally
            </Text>
          </View>

          {/* Form */}
          <View style={[styles.card, { backgroundColor: colors.backgroundCard }]}>
            {fields.map((field) => (
              <View key={field.key} style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{field.label}</Text>
                <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
                  <Text style={styles.inputIcon}>{field.icon}</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textMuted}
                    keyboardType={field.keyboard}
                    autoCapitalize={field.key === 'name' ? 'words' : 'none'}
                    secureTextEntry={field.secure && !showPassword}
                    autoCorrect={false}
                  />
                  {field.secure && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {/* Health info hint */}
            <View style={[styles.hint, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: 14 }}>💡</Text>
              <Text style={[styles.hintText, { color: colors.primary }]}>
                Setelah mendaftar, Anda dapat melengkapi kondisi medis untuk personalisasi Heally AI yang lebih baik.
              </Text>
            </View>

            {/* Register button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              style={[styles.btn, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.btnText}>Daftar Sekarang</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Back to login */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Text style={[styles.backText, { color: colors.textSecondary }]}>
              Sudah punya akun?{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Masuk</Text>
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
  header: { alignItems: 'center', gap: 8 },
  logoContainer: {
    width: 64, height: 64, borderRadius: BorderRadius.xl,
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 32 },
  title: { fontSize: FontSize.xl, fontWeight: '800' },
  subtitle: { fontSize: FontSize.sm, textAlign: 'center' },
  card: {
    borderRadius: BorderRadius.xxl, padding: Spacing.xl, gap: Spacing.base,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  fieldGroup: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderRadius: BorderRadius.lg,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: FontSize.sm, minHeight: 22 },
  hint: {
    flexDirection: 'row', gap: 8, padding: 12,
    borderRadius: BorderRadius.lg, alignItems: 'flex-start',
  },
  hintText: { fontSize: FontSize.xs, lineHeight: 17, flex: 1 },
  btn: {
    paddingVertical: 14, borderRadius: BorderRadius.lg, alignItems: 'center',
    shadowColor: '#16A34A', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnText: { color: 'white', fontSize: FontSize.md, fontWeight: '700' },
  backBtn: { alignItems: 'center' },
  backText: { fontSize: FontSize.sm },
});
