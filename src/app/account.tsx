import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme,
  Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { goBackOr } from '@/utils/go-back';
import { useAuthStore } from '@/store/auth-store';
import { userToIdentityProfile } from '@/features/identity/user-identity';
import { formatIdentityRows, formatIdentityUpdatedAt } from '@/features/lifestyle/identity-display';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { AppScreen } from '@/components/screen-background';
import { useScreenTopPadding } from '@/hooks/use-screen-top-padding';
import { Icon, Button, InitialsAvatar, surfaceHeaderShell } from '@/components/ui';
import { clearSehaticaWidget, requestAddSehaticaWidget } from '@/widgets/sync-widget';

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
  const identity = userToIdentityProfile(user);
  const identityRows = formatIdentityRows(identity);
  const identityUpdatedAt = formatIdentityUpdatedAt(identity?.completedAt);
  const [pinningWidget, setPinningWidget] = useState(false);

  const handleLogout = async () => {
    await clearSehaticaWidget();
    await clearAuth();
    router.replace('/(auth)/login');
  };

  const handleAddWidget = async () => {
    setPinningWidget(true);
    try {
      const ok = await requestAddSehaticaWidget();
      if (ok) {
        Alert.alert(
          'Tambah widget',
          'Konfirmasi di layar sistem untuk menempelkan widget Sehatica ke home screen.',
        );
      } else {
        Alert.alert(
          'Tambah widget manual',
          'Tekan lama di home screen → Widget → pilih Sehatica Dashboard.',
        );
      }
    } finally {
      setPinningWidget(false);
    }
  };

  return (
    <AppScreen style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <View style={[styles.topBar, surfaceHeaderShell(colors), { paddingTop: topPadding, backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => goBackOr('/(tabs)')} style={styles.backBtn} activeOpacity={0.7}>
            <Icon name="arrow-back" size="md" color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: colors.text }]}>Akun</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileBlock}>
            <InitialsAvatar
              initials={user?.avatarInitials}
              name={user?.name}
              size="xl"
            />
            <Text style={[styles.name, { color: colors.text }]}>{user?.name ?? 'Pengguna'}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.backgroundCard }]}>
            <InfoRow label="Email" value={user?.email ?? '-'} colors={colors} />
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            <InfoRow label="Telepon" value={user?.phone?.trim() || 'Belum diisi'} colors={colors} muted={!user?.phone} />
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            <InfoRow label="Terakhir aktif" value={formatLastActive()} colors={colors} />
          </View>

          <View style={[styles.card, { backgroundColor: colors.backgroundCard }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderCopy}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Data diri</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                  {identity
                    ? identityUpdatedAt
                      ? `Terakhir diperbarui ${identityUpdatedAt}`
                      : 'Dari onboarding'
                    : 'Belum diisi'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/account/identity')}
                style={[styles.editBtn, { backgroundColor: colors.primaryLight }]}
                activeOpacity={0.8}
              >
                <Icon name="create-outline" size="sm" color={colors.primary} />
                <Text style={[styles.editBtnText, { color: colors.primary }]}>
                  {identity ? 'Edit' : 'Isi'}
                </Text>
              </TouchableOpacity>
            </View>

            {identityRows.length > 0 ? (
              identityRows.map((row, index) => (
                <View key={row.key}>
                  {index > 0 ? <View style={[styles.divider, { backgroundColor: colors.borderLight }]} /> : null}
                  <InfoRow label={row.label} value={row.value} colors={colors} />
                </View>
              ))
            ) : (
              <Text style={[styles.emptyIdentity, { color: colors.textMuted }]}>
                Lengkapi data diri untuk perhitungan skor risiko PTM.
              </Text>
            )}
          </View>

          {Platform.OS === 'android' ? (
            <View style={[styles.card, { backgroundColor: colors.backgroundCard }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Widget home screen</Text>
              <Text style={[styles.widgetHint, { color: colors.textMuted }]}>
                Tampilkan risiko PTM, status kuisioner, dan janji hari ini di layar utama.
              </Text>
              <Button
                label={pinningWidget ? 'Meminta izin...' : 'Tambah widget Sehatica'}
                onPress={handleAddWidget}
                loading={pinningWidget}
                fullWidth
              />
            </View>
          ) : null}

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
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardHeaderCopy: { flex: 1, gap: 2 },
  cardTitle: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.bold,
  },
  cardSubtitle: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.regular,
  },
  widgetHint: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.regular,
    lineHeight: 18,
    marginBottom: 4,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  editBtnText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.semibold,
  },
  emptyIdentity: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.regular,
    lineHeight: 18,
    paddingTop: 4,
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
