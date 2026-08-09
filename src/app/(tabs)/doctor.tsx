import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, useColorScheme,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { doctorService } from '@/services/doctor.service';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { EmptyState, Icon, IconName, ScreenHeader } from '@/components/ui';

export default function DoctorScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  const { data: doctors = [], error, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorService.getAll,
    placeholderData: [],
  });

  function StarRating({ rating }: { rating: number }) {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= Math.round(rating) ? 'star' : 'star-outline'}
            size="sm"
            color={star <= Math.round(rating) ? colors.amber : colors.border}
          />
        ))}
        <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{rating.toFixed(1)}</Text>
      </View>
    );
  }

  const stats: { label: string; value: string; icon: IconName }[] = [
    {
      label: 'Verifikasi',
      value: `${doctors.reduce((a, d) => a + d.verifiedCount, 0)}`,
      icon: 'checkmark-circle-outline',
    },
    {
      label: 'Dokter aktif',
      value: `${doctors.filter((d) => d.isAvailable).length}`,
      icon: 'medkit-outline',
    },
    {
      label: 'Avg rating',
      value: doctors.length
        ? `${(doctors.reduce((a, d) => a + d.rating, 0) / doctors.length).toFixed(1)}`
        : '—',
      icon: 'star-outline',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Dokter partner"
        subtitle={`${doctors.filter((d) => d.isAvailable).length} dokter tersedia untuk review`}
      >
        <View style={[styles.verifBanner, { backgroundColor: colors.primaryLight }]}>
          <Icon name="medkit-outline" size="sm" color={colors.primary} />
          <Text style={[styles.verifBannerText, { color: colors.primaryDark }]}>
            Saran Heally yang perlu verifikasi dikirim ke dokter di sini
          </Text>
        </View>
      </ScreenHeader>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Daftar dokter tidak dapat dibuka"
          description={error instanceof Error ? error.message : 'Periksa koneksi lalu coba lagi.'}
          actionLabel="Coba lagi"
          onAction={refetch}
        />
      ) : doctors.length === 0 ? (
        <EmptyState
          icon="medkit-outline"
          title="Belum ada dokter tersedia"
          description="Dokter terverifikasi akan muncul di sini setelah tersedia untuk menerima review."
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
        >
          <View style={styles.statsRow}>
            {stats.map(({ label, value, icon }) => (
              <View key={label} style={[styles.statCard, { borderColor: colors.border }]}>
                <Icon name={icon} size="md" color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Dokter tersedia</Text>
          {doctors.map((doctor) => (
            <View key={doctor.id} style={[styles.doctorCard, { borderColor: colors.border }]}>
              <View style={styles.doctorTop}>
                <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.avatarText, { color: colors.primary }]}>{doctor.avatarInitials}</Text>
                  {doctor.isAvailable && <View style={styles.availableDot} />}
                </View>

                <View style={styles.doctorInfo}>
                  <Text style={[styles.doctorName, { color: colors.text }]} numberOfLines={1}>
                    {doctor.name}
                  </Text>
                  <Text style={[styles.specialty, { color: colors.textSecondary }]}>{doctor.specialty}</Text>
                  <StarRating rating={doctor.rating} />
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: doctor.isAvailable ? colors.primaryLight : colors.backgroundElement,
                      borderColor: doctor.isAvailable ? colors.primaryMuted : colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: doctor.isAvailable ? '#4ADE80' : '#A1A1AA' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: doctor.isAvailable ? colors.primary : colors.textMuted },
                    ]}
                  >
                    {doctor.isAvailable ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>

              <View style={[styles.doctorStats, { borderTopColor: colors.borderLight }]}>
                <View style={styles.doctorStat}>
                  <Text style={[styles.doctorStatValue, { color: colors.text }]}>{doctor.verifiedCount}</Text>
                  <Text style={[styles.doctorStatLabel, { color: colors.textMuted }]}>Verifikasi</Text>
                </View>
                <View style={[styles.doctorStatDivider, { backgroundColor: colors.border }]} />
                <View style={styles.doctorStat}>
                  <Text style={[styles.doctorStatValue, { color: colors.text }]}>{doctor.reviewCount}</Text>
                  <Text style={[styles.doctorStatLabel, { color: colors.textMuted }]}>Ulasan</Text>
                </View>
                <View style={[styles.doctorStatDivider, { backgroundColor: colors.border }]} />
                <View style={styles.doctorStat}>
                  <Text style={[styles.doctorStatValue, { color: colors.text }]}>{doctor.rating.toFixed(1)}</Text>
                  <Text style={[styles.doctorStatLabel, { color: colors.textMuted }]}>Rating</Text>
                </View>
              </View>

              {doctor.bio ? (
                <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={2}>
                  {doctor.bio}
                </Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.consultBtn,
                  {
                    backgroundColor: doctor.isAvailable ? colors.primary : colors.backgroundElement,
                    opacity: doctor.isAvailable ? 1 : 0.6,
                  },
                ]}
                activeOpacity={0.8}
                disabled={!doctor.isAvailable}
                onPress={() => router.push('/(tabs)/heally')}
              >
                <Icon
                  name="call-outline"
                  size="sm"
                  color={doctor.isAvailable ? colors.onPrimary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.consultBtnText,
                    { color: doctor.isAvailable ? 'white' : colors.textMuted },
                  ]}
                >
                  {doctor.isAvailable ? 'Buka Heally untuk review' : 'Sedang tidak tersedia'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  verifBanner: {
    flexDirection: 'row', gap: 8,
    marginHorizontal: Spacing.lg, marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderRadius: BorderRadius.md, alignItems: 'center',
  },
  verifBannerText: { fontSize: FontSize.xs, lineHeight: 16, flex: 1, fontFamily: Fonts.regular },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.lg, gap: 12, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1, alignItems: 'center', gap: 4, padding: 12,
    borderRadius: BorderRadius.md, borderWidth: 1,
  },
  statValue: { fontSize: FontSize.md, fontFamily: Fonts.bold },
  statLabel: { fontSize: FontSize.xs, textAlign: 'center', fontFamily: Fonts.regular },
  sectionTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  doctorCard: { borderRadius: BorderRadius.md, borderWidth: 1, overflow: 'hidden' },
  doctorTop: { flexDirection: 'row', gap: 12, padding: Spacing.base, alignItems: 'flex-start' },
  avatar: {
    width: 48, height: 48, borderRadius: BorderRadius.sm,
    alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0,
  },
  avatarText: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  availableDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#4ADE80', borderWidth: 2, borderColor: 'white',
  },
  doctorInfo: { flex: 1, gap: 3 },
  doctorName: { fontSize: FontSize.sm, fontFamily: Fonts.bold, lineHeight: 18 },
  specialty: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  ratingText: { fontSize: FontSize.xs, marginLeft: 4, fontFamily: Fonts.medium },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: BorderRadius.full, borderWidth: 1, flexShrink: 0,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  doctorStats: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1 },
  doctorStat: { flex: 1, alignItems: 'center', gap: 2 },
  doctorStatValue: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  doctorStatLabel: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  doctorStatDivider: { width: 1, height: 28 },
  bio: { paddingHorizontal: Spacing.base, fontSize: FontSize.xs, lineHeight: 17, fontFamily: Fonts.regular },
  consultBtn: {
    margin: Spacing.base, paddingVertical: 12, borderRadius: BorderRadius.md,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  consultBtnText: { fontFamily: Fonts.bold, fontSize: FontSize.sm },
});
