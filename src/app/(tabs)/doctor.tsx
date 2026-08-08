import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, useColorScheme, Alert,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '@/services/doctor.service';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { Icon, IconName, ScreenHeader } from '@/components/ui';
import { DoctorQrScanner } from '@/components/doctor-qr-scanner';
import { Doctor } from '@/types';

export default function DoctorScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const queryClient = useQueryClient();
  const [scannerOpen, setScannerOpen] = useState(false);

  const { data: doctors = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorService.getAll,
    placeholderData: [],
  });

  const addPartnerMutation = useMutation({
    mutationFn: doctorService.addPartnerByCode,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setScannerOpen(false);
      const name = result.doctor?.name ?? 'Dokter';
      Alert.alert(
        result.alreadyLinked ? 'Sudah terhubung' : 'Partner ditambahkan',
        result.alreadyLinked
          ? `${name} sudah ada di daftar partner Anda.`
          : `${name} berhasil ditambahkan sebagai partner.`
      );
    },
    onError: (err: any) => {
      Alert.alert('Gagal', err.message ?? 'Tidak bisa menambahkan dokter');
    },
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

  const displayDoctors: Doctor[] = doctors.length > 0 ? doctors : [];
  const partners = displayDoctors.filter((d) => d.isYours);
  const others = displayDoctors.filter((d) => !d.isYours);

  const stats: { label: string; value: string; icon: IconName }[] = [
    {
      label: 'Partner',
      value: `${partners.length}`,
      icon: 'people-outline',
    },
    {
      label: 'Dokter aktif',
      value: `${displayDoctors.filter((d) => d.isAvailable).length}`,
      icon: 'medkit-outline',
    },
    {
      label: 'Avg rating',
      value: displayDoctors.length
        ? `${(displayDoctors.reduce((a, d) => a + d.rating, 0) / displayDoctors.length).toFixed(1)}`
        : '—',
      icon: 'star-outline',
    },
  ];

  const renderDoctor = (doctor: Doctor) => (
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

      {doctor.isYours ? (
        <View style={[styles.partnerTag, { backgroundColor: colors.primaryLight }]}>
          <Icon name="checkmark-circle" size="sm" color={colors.primary} />
          <Text style={[styles.partnerTagText, { color: colors.primary }]}>Partner Anda</Text>
        </View>
      ) : null}

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
          {doctor.isAvailable ? 'Konsultasi sekarang' : 'Sedang tidak tersedia'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Dokter partner"
        subtitle={`${partners.length} partner · scan QR untuk menambah`}
        right={
          <TouchableOpacity
            onPress={() => setScannerOpen(true)}
            style={[styles.qrBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            accessibilityLabel="Scan QR dokter"
          >
            <Icon name="qr-code-outline" size="md" color={colors.onPrimary} />
          </TouchableOpacity>
        }
      >
        <TouchableOpacity
          onPress={() => setScannerOpen(true)}
          style={[styles.addRow, { backgroundColor: colors.backgroundElement }]}
          activeOpacity={0.75}
        >
          <View style={[styles.addIcon, { backgroundColor: colors.background }]}>
            <Icon name="person-add-outline" size="md" color={colors.primary} />
          </View>
          <View style={styles.addCopy}>
            <Text style={[styles.addTitle, { color: colors.text }]}>Tambah dokter</Text>
            <Text style={[styles.addSub, { color: colors.textMuted }]}>
              Scan QR dokter untuk jadi partner
            </Text>
          </View>
          <Icon name="scan-outline" size="md" color={colors.textMuted} />
        </TouchableOpacity>
      </ScreenHeader>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
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

          {partners.length > 0 ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Partner saya</Text>
              {partners.map(renderDoctor)}
            </>
          ) : null}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {partners.length > 0 ? 'Dokter lain' : 'Dokter tersedia'}
          </Text>
          {others.length > 0 ? (
            others.map(renderDoctor)
          ) : partners.length === 0 ? (
            <TouchableOpacity
              onPress={() => setScannerOpen(true)}
              style={[styles.emptyCard, { borderColor: colors.border }]}
              activeOpacity={0.75}
            >
              <Icon name="qr-code-outline" size="lg" color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum ada dokter</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                Scan QR dokter untuk menambah partner pertama Anda
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              Semua dokter sudah jadi partner Anda
            </Text>
          )}
        </ScrollView>
      )}

      <DoctorQrScanner
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        loading={addPartnerMutation.isPending}
        onScan={(code) => addPartnerMutation.mutateAsync(code)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  qrBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  addRow: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  addCopy: { flex: 1, gap: 2 },
  addTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  addSub: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.lg, gap: 12, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1, alignItems: 'center', gap: 4, padding: 12,
    borderRadius: BorderRadius.md, borderWidth: 1,
  },
  statValue: { fontSize: FontSize.md, fontFamily: Fonts.bold },
  statLabel: { fontSize: FontSize.xs, textAlign: 'center', fontFamily: Fonts.regular },
  sectionTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold, marginTop: 4 },
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
  partnerTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: Spacing.base, alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full,
  },
  partnerTagText: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  bio: { paddingHorizontal: Spacing.base, paddingTop: 8, fontSize: FontSize.xs, lineHeight: 17, fontFamily: Fonts.regular },
  consultBtn: {
    margin: Spacing.base, paddingVertical: 12, borderRadius: BorderRadius.md,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  consultBtnText: { fontFamily: Fonts.bold, fontSize: FontSize.sm },
  emptyCard: {
    alignItems: 'center', gap: 8, padding: Spacing.xl,
    borderRadius: BorderRadius.md, borderWidth: 1, borderStyle: 'dashed',
  },
  emptyTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  emptyDesc: { fontSize: FontSize.xs, fontFamily: Fonts.regular, textAlign: 'center' },
});
