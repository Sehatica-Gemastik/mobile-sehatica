import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, useColorScheme, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

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
      <View style={[styles.container, { backgroundColor: '#16A34A' }]}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Memuat dashboard...</Text>
        </SafeAreaView>
      </View>
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
        {/* ── Header ── */}
        <View style={{ backgroundColor: colors.background }}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()},</Text>
                  <Text style={[styles.userName, { color: colors.text }]}>{user?.name ?? 'Pengguna'} 👋</Text>
                </View>
                <TouchableOpacity style={[styles.bellBtn, { backgroundColor: colors.backgroundElement }]} activeOpacity={0.7}>
                  <Text style={{ fontSize: 18 }}>🔔</Text>
                  <View style={[styles.bellBadge, { borderColor: colors.backgroundElement }]} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.todayText, { color: colors.textMuted }]}>{todayLabel}</Text>

              {/* Next schedule pill using HaloAI primary button style */}
              {nextItem && (
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/schedule')}
                  activeOpacity={0.8}
                  style={[styles.nextScheduleOuter, { backgroundColor: colors.primary }]}
                >
                  <View style={styles.nextSchedulePill}>
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
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }}>›</Text>
                  </View>
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
              <View style={styles.uploadIconContainer}>
                <Text style={{ fontSize: 18 }}>📤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.uploadTitle, { color: '#92400E' }]}>Rekam medis perlu diperbarui</Text>
                <Text style={[styles.uploadDesc, { color: '#B45309' }]}>
                  Upload hasil kunjungan dokter terbaru agar Heally bisa memberikan saran yang akurat.
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Heally Daily Insight */}
          {dashboard?.dailyInsight && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.sectionIconGradient, { backgroundColor: colors.accent }]}>
                    <Text style={{ fontSize: 12 }}>🤖</Text>
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Insight Heally Hari Ini</Text>
                </View>
                <View style={[styles.unverifiedBadge, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                  <Text style={[styles.unverifiedText, { color: colors.textSecondary }]}>Belum diverifikasi</Text>
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
            <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
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
                  style={[styles.emptyCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundElement }]}>
                    <Text style={{ fontSize: 18 }}>📅</Text>
                  </View>
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
                <View style={[styles.emptyCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
                  <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundElement }]}>
                    <Text style={{ fontSize: 18 }}>📋</Text>
                  </View>
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
  loadingText: { color: 'white', fontSize: FontSize.sm, fontFamily: 'Inter_500Medium' },
  headerContent: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, paddingBottom: Spacing.xl },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  greeting: { fontSize: FontSize.sm, fontFamily: 'Inter_500Medium' },
  userName: { fontSize: FontSize.xxl, fontFamily: 'PlayfairDisplay_600SemiBold', letterSpacing: -0.5 },
  todayText: { fontSize: FontSize.xs, marginBottom: 16, fontFamily: 'Inter_400Regular' },
  bellBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute', top: 2, right: 2,
    width: 8, height: 8, backgroundColor: '#F87171',
    borderRadius: 4, borderWidth: 1,
  },
  nextScheduleOuter: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  nextSchedulePill: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, paddingHorizontal: 16,
  },
  nextScheduleIcon: {
    width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center',
  },
  nextScheduleHint: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  nextScheduleLabel: { color: 'white', fontSize: FontSize.sm, fontFamily: 'Inter_700Bold', lineHeight: 18 },
  nextScheduleDetail: { color: '#D4D4D8', fontSize: FontSize.xs, fontFamily: 'Inter_400Regular' },
  body: { padding: Spacing.lg, gap: Spacing.xl },
  uploadCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: BorderRadius.lg, padding: Spacing.base, borderWidth: 1,
  },
  uploadIconContainer: {
    width: 36, height: 36, borderRadius: BorderRadius.full, backgroundColor: '#FEF3C7',
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  uploadTitle: { fontSize: FontSize.sm, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  uploadDesc: { fontSize: FontSize.xs, lineHeight: 18, fontFamily: 'Inter_400Regular' },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionIconGradient: { width: 24, height: 24, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: FontSize.lg, fontFamily: 'PlayfairDisplay_600SemiBold' },
  seeAll: { fontSize: FontSize.xs, fontFamily: 'Inter_500Medium' },
  progressText: { fontSize: FontSize.xs, fontFamily: 'Inter_700Bold' },
  unverifiedBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full, borderWidth: 1 },
  unverifiedText: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: 6, borderRadius: 3 },
  itemsList: { gap: 10 },
  insightCard: { borderRadius: BorderRadius.lg, borderWidth: 1, overflow: 'hidden' },
  insightMain: { padding: Spacing.base, paddingVertical: 14, borderBottomWidth: 1 },
  insightText: { fontSize: FontSize.sm, lineHeight: 22, fontFamily: 'Inter_400Regular' },
  insightTips: { padding: Spacing.base, gap: 10 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  tipText: { fontSize: FontSize.xs, lineHeight: 18, flex: 1, fontFamily: 'Inter_400Regular' },
  insightAction: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.base },
  insightActionText: { fontSize: FontSize.xs, fontFamily: 'Inter_700Bold' },
  emptyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.base, borderRadius: BorderRadius.lg, borderWidth: 1,
  },
  emptyIcon: { width: 36, height: 36, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: FontSize.xs, lineHeight: 18, flex: 1, fontFamily: 'Inter_400Regular' },
});
