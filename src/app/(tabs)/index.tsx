import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { homeService } from '@/services/verif.service';
import { scheduleService } from '@/services/schedule.service';
import { useAuthStore } from '@/store/auth-store';
import { Colors, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { ScheduleItemCard } from '@/components/schedule-item';
import { MedicalRecordCard } from '@/components/medical-record-card';
import { ScheduleItem } from '@/types';

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: homeService.getDashboard,
  });

  const toggleMutation = useMutation({
    mutationFn: scheduleService.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat pagi';
    if (hour < 17) return 'Selamat siang';
    if (hour < 20) return 'Selamat sore';
    return 'Selamat malam';
  };

  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#16A34A' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Memuat dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progress = dashboard?.scheduleProgress;
  const pct = progress?.percentage ?? 0;
  const nextItem = dashboard?.nextScheduleItem;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── Green Header ── */}
        <View style={styles.header}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.greeting}>{getGreeting()},</Text>
                  <Text style={styles.userName}>{user?.name ?? 'Pengguna'} 👋</Text>
                </View>
                <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
                  <Text style={{ fontSize: 20 }}>🔔</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.todayText}>{todayLabel}</Text>

              {/* Next schedule pill */}
              {nextItem && (
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/schedule')}
                  style={styles.nextSchedulePill}
                  activeOpacity={0.8}
                >
                  <View style={styles.nextScheduleIcon}>
                    <Text style={{ fontSize: 16 }}>
                      {nextItem.type === 'pill' ? '💊' : nextItem.type === 'food' ? '🍽️' : nextItem.type === 'exercise' ? '🏃' : '💧'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nextScheduleHint}>Selanjutnya</Text>
                    <Text style={styles.nextScheduleLabel}>{nextItem.label}</Text>
                    <Text style={styles.nextScheduleDetail}>{nextItem.time} · {nextItem.detail}</Text>
                  </View>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }}>›</Text>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>

          {/* Upload reminder (if no records) */}
          {(!dashboard?.recentRecords || dashboard.recentRecords.length === 0) && (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/records')}
              style={[styles.uploadCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 24 }}>📤</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.uploadTitle, { color: '#92400E' }]}>Belum ada rekam medis</Text>
                <Text style={[styles.uploadDesc, { color: '#B45309' }]}>
                  Upload rekam medis agar Heally bisa memberikan saran yang personal dan akurat.
                </Text>
              </View>
              <Text style={{ color: '#F59E0B', fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          )}

          {/* Heally Daily Insight */}
          {dashboard?.dailyInsight && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.sectionIconBg, { backgroundColor: colors.primaryLight }]}>
                    <Text style={{ fontSize: 14 }}>🤖</Text>
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Insight Heally Hari Ini</Text>
                </View>
                <View style={[styles.unverifiedBadge, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                  <Text style={[styles.unverifiedText, { color: '#B45309' }]}>Belum diverifikasi</Text>
                </View>
              </View>
              <View style={[styles.insightCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
                <View style={[styles.insightMain, { borderBottomColor: colors.borderLight }]}>
                  <Text style={[styles.insightText, { color: colors.text }]}>
                    {dashboard.dailyInsight.mainInsight}
                  </Text>
                </View>
                <View style={styles.insightTips}>
                  {dashboard.dailyInsight.tips.map((tip, i) => (
                    <View key={i} style={styles.tipRow}>
                      <Text style={{ fontSize: 16 }}>{tip.emoji}</Text>
                      <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip.text}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/heally')}
                  style={styles.insightAction}
                >
                  <Text style={[styles.insightActionText, { color: colors.primary }]}>
                    Tanya lebih lanjut ke Heally ›
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Today's Schedule */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Jadwal Hari Ini</Text>
              <View style={styles.sectionRight}>
                <Text style={[styles.progressText, { color: colors.primary }]}>
                  {progress?.done ?? 0}/{progress?.total ?? 0} selesai
                </Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/schedule')}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>Lihat semua ›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Progress bar */}
            <View style={[styles.progressBar, { backgroundColor: colors.backgroundElement }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.primary, width: `${pct}%` as any },
                ]}
              />
            </View>

            {/* Schedule items */}
            <View style={styles.itemsList}>
              {dashboard?.todaySchedule && dashboard.todaySchedule.length > 0 ? (
                dashboard.todaySchedule.slice(0, 5).map((item: ScheduleItem) => (
                  <ScheduleItemCard
                    key={item.id}
                    item={item}
                    onToggle={() => toggleMutation.mutate(item.id)}
                  />
                ))
              ) : (
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/schedule')}
                  style={[styles.emptyCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 24 }}>📅</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Belum ada jadwal hari ini. Tap untuk membuat jadwal AI.
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Recent Medical Records */}
          <View style={[styles.section, { marginBottom: Spacing.xxxl }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Rekam Medis Terbaru</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/records')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>Semua ›</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.itemsList}>
              {dashboard?.recentRecords && dashboard.recentRecords.length > 0 ? (
                dashboard.recentRecords.map((rec) => (
                  <MedicalRecordCard key={rec.id} record={rec} compact />
                ))
              ) : (
                <View style={[styles.emptyCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                  <Text style={{ fontSize: 24 }}>📋</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Belum ada rekam medis tersimpan
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: 'white', fontSize: FontSize.sm, fontWeight: '500' },
  header: { backgroundColor: '#16A34A' },
  headerContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm, fontWeight: '500' },
  userName: { color: 'white', fontSize: FontSize.xxl, fontWeight: '800', letterSpacing: -0.5 },
  todayText: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, marginBottom: 12 },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  nextSchedulePill: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.xl, padding: 12,
  },
  nextScheduleIcon: {
    width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  nextScheduleHint: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, fontWeight: '600', textTransform: 'uppercase' },
  nextScheduleLabel: { color: 'white', fontSize: FontSize.sm, fontWeight: '700' },
  nextScheduleDetail: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs },
  body: { padding: Spacing.lg, gap: Spacing.lg },
  uploadCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: BorderRadius.xl, padding: Spacing.base, borderWidth: 1.5,
  },
  uploadTitle: { fontSize: FontSize.sm, fontWeight: '700', marginBottom: 2 },
  uploadDesc: { fontSize: FontSize.xs, lineHeight: 16 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionIconBg: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '700' },
  seeAll: { fontSize: FontSize.xs, fontWeight: '600' },
  progressText: { fontSize: FontSize.xs, fontWeight: '700' },
  unverifiedBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full, borderWidth: 1 },
  unverifiedText: { fontSize: FontSize.xs, fontWeight: '600' },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  itemsList: { gap: 8 },
  insightCard: { borderRadius: BorderRadius.xl, borderWidth: 1, overflow: 'hidden' },
  insightMain: { padding: Spacing.base, borderBottomWidth: 1 },
  insightText: { fontSize: FontSize.sm, lineHeight: 20 },
  insightTips: { padding: Spacing.base, gap: 8 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  tipText: { fontSize: FontSize.xs, lineHeight: 17, flex: 1 },
  insightAction: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.base },
  insightActionText: { fontSize: FontSize.xs, fontWeight: '600' },
  emptyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.base, borderRadius: BorderRadius.xl, borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyText: { fontSize: FontSize.xs, lineHeight: 16, flex: 1 },
});
