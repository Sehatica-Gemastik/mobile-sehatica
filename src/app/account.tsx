import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { AppScreen } from '@/components/screen-background';
import { useScreenTopPadding } from '@/hooks/use-screen-top-padding';
import { Icon, Button, surfaceHeaderShell } from '@/components/ui';

function formatLastActive() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AccountScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const topPadding = useScreenTopPadding();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    await clearAuth();
    router.replace('/(auth)/login');
  };

  return (
    <AppScreen style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <View style={[styles.topBar, surfaceHeaderShell(colors), { paddingTop: topPadding, backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Icon name="arrow-back" size="md" color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: colors.text }]}>Akun</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileBlock}>
            <View style={styles.avatarLarge}>
              <Icon name="person-outline" size="lg" color="#9CA3AF" />
            </View>
            <Text style={[styles.name, { color: colors.text }]}>{user?.name ?? 'Pengguna'}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.backgroundCard }]}>
            <InfoRow label="Email" value={user?.email ?? '-'} colors={colors} />
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            <InfoRow label="Telepon" value={user?.phone?.trim() || 'Belum diisi'} colors={colors} muted={!user?.phone} />
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            <InfoRow label="Terakhir aktif" value={formatLastActive()} colors={colors} />
          </View>

          <Button label="Keluar" variant="secondary" onPress={handleLogout} fullWidth />
        </ScrollView>
      </SafeAreaView>
    </AppScreen>
  );
}

function InfoRow({
  label,
  value,
  colors,
  muted,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
  muted?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: muted ? colors.textMuted : colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: FontSize.md,
    fontFamily: Fonts.bold,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  profileBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: FontSize.xl,
    fontFamily: Fonts.bold,
    letterSpacing: -0.3,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  infoRow: { gap: 4, paddingVertical: 4 },
  infoLabel: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 8 },
});
