import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '@/services/doctor.service';
import { Colors, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { Doctor } from '@/types';

const SPECIALTIES = ['Semua', 'Umum', 'Penyakit Dalam', 'Jantung', 'Saraf', 'Anak'];

export default function DoctorScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const { data: doctors = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorService.getAll,
    placeholderData: [], // Don't block render
  });

  function StarRating({ rating }: { rating: number }) {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={{ fontSize: 12, color: star <= Math.round(rating) ? '#F59E0B' : '#D1D5DB' }}>
            ★
          </Text>
        ))}
        <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{rating.toFixed(1)}</Text>
      </View>
    );
  }

  // Fallback doctors for demo
  const displayDoctors: Doctor[] = doctors.length > 0 ? doctors : [
    { id: 1, name: 'Dr. Andi Kusuma, Sp.PD', specialty: 'Penyakit Dalam', rating: 4.9, reviewCount: 124, verifiedCount: 87, isAvailable: true, bio: 'Spesialis penyakit dalam berpengalaman 15 tahun', avatarInitials: 'AK', colorScheme: 'blue' },
    { id: 2, name: 'Dr. Sarah Lestari, Sp.J', specialty: 'Jantung & Pembuluh Darah', rating: 4.8, reviewCount: 98, verifiedCount: 65, isAvailable: false, bio: 'Spesialis jantung lulusan UI', avatarInitials: 'SL', colorScheme: 'blue' },
    { id: 3, name: 'Dr. Budi Santoso, Sp.N', specialty: 'Neurologi', rating: 4.7, reviewCount: 72, verifiedCount: 43, isAvailable: true, bio: 'Ahli saraf dan stroke', avatarInitials: 'BS', colorScheme: 'blue' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.backgroundCard, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Dokter Partner</Text>
            <Text style={[styles.headerSub, { color: colors.textMuted }]}>
              {displayDoctors.filter((d) => d.isAvailable).length} dokter online sekarang
            </Text>
          </View>
        </View>

        {/* Heally verif explanation */}
        <View style={[styles.verifBanner, { backgroundColor: colors.primaryLight }]}>
          <Text style={{ fontSize: 14 }}>🩺</Text>
          <Text style={[styles.verifBannerText, { color: colors.primary }]}>
            Saran Heally yang perlu verifikasi akan dikirim ke dokter di sini untuk ditinjau
          </Text>
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
        >
          {/* Verif stats */}
          <View style={styles.statsRow}>
            {[
              { label: 'Total Verifikasi', value: `${displayDoctors.reduce((a, d) => a + d.verifiedCount, 0)}+`, icon: '✅' },
              { label: 'Dokter Aktif', value: `${displayDoctors.filter((d) => d.isAvailable).length}`, icon: '🩺' },
              { label: 'Avg Rating', value: `${(displayDoctors.reduce((a, d) => a + d.rating, 0) / displayDoctors.length).toFixed(1)}`, icon: '⭐' },
            ].map(({ label, value, icon }) => (
              <View key={label} style={[styles.statCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
                <Text style={{ fontSize: 20 }}>{icon}</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Doctor cards */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Dokter Tersedia</Text>
          {displayDoctors.map((doctor) => (
            <View key={doctor.id} style={[styles.doctorCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
              {/* Card top */}
              <View style={styles.doctorTop}>
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.avatarText, { color: colors.primary }]}>{doctor.avatarInitials}</Text>
                  {doctor.isAvailable && <View style={styles.availableDot} />}
                </View>

                {/* Info */}
                <View style={styles.doctorInfo}>
                  <Text style={[styles.doctorName, { color: colors.text }]} numberOfLines={1}>
                    {doctor.name}
                  </Text>
                  <Text style={[styles.specialty, { color: colors.textSecondary }]}>{doctor.specialty}</Text>
                  <StarRating rating={doctor.rating} />
                </View>

                {/* Status */}
                <View style={[
                  styles.statusBadge,
                  {
                    backgroundColor: doctor.isAvailable ? colors.primaryLight : colors.backgroundElement,
                    borderColor: doctor.isAvailable ? '#86EFAC' : colors.border,
                  },
                ]}>
                  <View style={[styles.statusDot, { backgroundColor: doctor.isAvailable ? '#4ADE80' : '#9CA3AF' }]} />
                  <Text style={[styles.statusText, { color: doctor.isAvailable ? colors.primary : colors.textMuted }]}>
                    {doctor.isAvailable ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>

              {/* Stats row */}
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

              {/* Bio */}
              {doctor.bio && (
                <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={2}>
                  {doctor.bio}
                </Text>
              )}

              {/* Consultation button */}
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
              >
                <Text style={[
                  styles.consultBtnText,
                  { color: doctor.isAvailable ? 'white' : colors.textMuted },
                ]}>
                  {doctor.isAvailable ? '📱 Konsultasi Sekarang' : 'Sedang Tidak Tersedia'}
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
  header: { borderBottomWidth: StyleSheet.hairlineWidth, gap: 10, paddingBottom: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800' },
  headerSub: { fontSize: FontSize.xs, marginTop: 2 },
  verifBanner: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg, paddingVertical: 8, alignItems: 'center' },
  verifBannerText: { fontSize: FontSize.xs, lineHeight: 16, flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.lg, gap: 12, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, alignItems: 'center', gap: 4, padding: 10, borderRadius: BorderRadius.xl, borderWidth: 1 },
  statValue: { fontSize: FontSize.md, fontWeight: '800' },
  statLabel: { fontSize: FontSize.xs, textAlign: 'center' },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '700' },
  doctorCard: { borderRadius: BorderRadius.xl, borderWidth: 1, overflow: 'hidden' },
  doctorTop: { flexDirection: 'row', gap: 12, padding: Spacing.base, alignItems: 'flex-start' },
  avatar: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 },
  avatarText: { fontSize: FontSize.md, fontWeight: '800' },
  availableDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ADE80', borderWidth: 2, borderColor: 'white' },
  doctorInfo: { flex: 1, gap: 3 },
  doctorName: { fontSize: FontSize.sm, fontWeight: '700', lineHeight: 18 },
  specialty: { fontSize: FontSize.xs },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  ratingText: { fontSize: FontSize.xs, marginLeft: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full, borderWidth: 1, flexShrink: 0 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSize.xs, fontWeight: '600' },
  doctorStats: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1 },
  doctorStat: { flex: 1, alignItems: 'center', gap: 2 },
  doctorStatValue: { fontSize: FontSize.sm, fontWeight: '700' },
  doctorStatLabel: { fontSize: FontSize.xs },
  doctorStatDivider: { width: 1, height: 28 },
  bio: { paddingHorizontal: Spacing.base, fontSize: FontSize.xs, lineHeight: 17 },
  consultBtn: { margin: Spacing.base, paddingVertical: 12, borderRadius: BorderRadius.lg, alignItems: 'center' },
  consultBtnText: { fontWeight: '700', fontSize: FontSize.sm },
});
