import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, useColorScheme, Alert,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { doctorService } from '@/services/doctor.service';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { EmptyState, Icon, InitialsAvatar, ScreenHeader } from '@/components/ui';
import { DoctorQrScanner } from '@/components/doctor-qr-scanner';
import { Doctor } from '@/types';

export default function DoctorScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const queryClient = useQueryClient();
  const [scannerOpen, setScannerOpen] = useState(false);

  const { data: partners = [], error, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['doctor-partners'],
    queryFn: doctorService.getPartners,
    placeholderData: [],
  });

  const addPartnerMutation = useMutation({
    mutationFn: doctorService.addPartnerByCode,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-partners'] });
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

  const renderPartner = (doctor: Doctor) => (
    <View
      key={doctor.id}
      style={[
        styles.partnerCard,
        Shadows.sm,
        { backgroundColor: colors.backgroundCard, borderColor: colors.borderLight },
      ]}
    >
      <View style={styles.cardTop}>
        <InitialsAvatar
          initials={doctor.avatarInitials}
          name={doctor.name}
          size="md"
          showOnline
          isOnline={doctor.isAvailable}
        />

        <View style={styles.doctorInfo}>
          <Text style={[styles.doctorName, { color: colors.text }]} numberOfLines={1}>
            {doctor.name}
          </Text>
          <Text style={[styles.specialty, { color: colors.textSecondary }]}>{doctor.specialty}</Text>
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

      <TouchableOpacity
        style={[
          styles.chatBtn,
          {
            backgroundColor: doctor.isAvailable ? colors.primary : colors.backgroundElement,
            opacity: doctor.isAvailable ? 1 : 0.7,
          },
        ]}
        activeOpacity={0.8}
        disabled={!doctor.isAvailable}
        onPress={() => router.push(`/chat/${doctor.id}`)}
      >
        <Icon
          name="chatbubble-outline"
          size="sm"
          color={doctor.isAvailable ? colors.onPrimary : colors.textMuted}
        />
        <Text
          style={[
            styles.chatBtnText,
            { color: doctor.isAvailable ? colors.onPrimary : colors.textMuted },
          ]}
        >
          {doctor.isAvailable ? 'Chat dokter' : 'Sedang offline'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Verifikasi partner"
        subtitle={
          partners.length > 0
            ? `${partners.length} partner · ${partners.filter((d) => d.isAvailable).length} online`
            : 'Hubungkan dokter via QR'
        }
      >
        <TouchableOpacity
          onPress={() => setScannerOpen(true)}
          style={[styles.addRow, { backgroundColor: colors.backgroundElement }]}
          activeOpacity={0.75}
        >
          <View style={[styles.addIcon, { backgroundColor: colors.backgroundCard }]}>
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
      ) : error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Daftar partner tidak dapat dibuka"
          description={error instanceof Error ? error.message : 'Periksa koneksi lalu coba lagi.'}
          actionLabel="Coba lagi"
          onAction={refetch}
        />
      ) : partners.length === 0 ? (
        <EmptyState
          icon="medkit-outline"
          title="Belum ada partner"
          description="Scan QR dokter untuk menambah partner verifikasi pertama Anda."
          actionLabel="Scan QR"
          onAction={() => setScannerOpen(true)}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
        >
          {partners.map(renderPartner)}
        </ScrollView>
      )}

      <DoctorQrScanner
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        loading={addPartnerMutation.isPending}
        onScan={(code) => { addPartnerMutation.mutate(code); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  partnerCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  doctorInfo: { flex: 1, gap: 3 },
  doctorName: { fontSize: FontSize.sm, fontFamily: Fonts.bold, lineHeight: 18 },
  specialty: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: BorderRadius.full, borderWidth: 1, flexShrink: 0,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  chatBtn: {
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  chatBtnText: { fontFamily: Fonts.bold, fontSize: FontSize.sm },
});
