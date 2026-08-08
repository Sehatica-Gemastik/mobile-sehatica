import React from 'react';
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
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { ScheduleItemCard } from '@/components/schedule-item';
import { MedicalRecordCard } from '@/components/medical-record-card';
import { Icon, scheduleIcons } from '@/components/ui';
import { ScheduleItem } from '@/types';

export default function HomeScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat dashboard...</Text>
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
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        <View style={{ backgroundColor: colors.background }}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()},</Text>
                  <Text style={[styles.userName, { color: colors.text }]}>{user?.name ?? 'Pengguna'}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.bellBtn, { backgroundColor: colors.backgroundElement }]}
                  activeOpacity={0.7}
                >
                  <Icon name="notifications-outline" size="md" color={colors.text} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.todayText, { color: colors.textMuted }]}>{todayLabel}</Text>

              {nextItem ? (
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/schedule')}
                  activeOpacity={0.8}
                  style={[styles.nextCard, { backgroundColor: colors.primary }]}
                >
                  <View style={styles.nextIcon}>
                    <Icon
                      name={scheduleIcons[nextItem.type] ?? scheduleIcons.other}
                      size="md"
                      color={colors.onPrimary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nextHint}>Selanjutnya</Text>
                    <Text style={styles.nextLabel}>{nextItem.label}</Text>
                    <Text style={styles.nextDetail}>{nextItem.time} · {nextItem.detail}</Text>
                  </View>
                  <Icon name="chevron-forward" size="sm" color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              ) : null}
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          {(!dashboard?.recentRecords || dashboard.recentRecords.length === 0) && (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/records')}
              style={[styles.uploadCard, { backgroundColor: colors.amberLight, borderColor: '#FDE68A' }]}
              activeOpacity={0.8}
            >
              <View style={[styles.uploadIcon, { backgroundColor: '#FEF3C7' }]}>
                <Icon name="cloud-upload-outline" size="md" color={colors.amber} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.uploadTitle, { color: '#92400E' }]}>Rekam medis perlu diperbarui</Text>
                <Text style={[styles.uploadDesc, { color: '#B45309' }]}>
                  Upload hasil kunjungan agar Heally lebih akurat.
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {dashboard?.dailyInsight ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLeft}>
                  <View style={[styles.sectionIcon, { backgroundColor: colors.primaryLight }]}>
                    <Icon name="sparkles" size="sm" color={colors.primary} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Insight Heally</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                  <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Belum diverifikasi</Text>
                </View>
              </View>

              <View style={[styles.insightCard, { borderColor: colors.border }]}>
                <View style={[styles.insightMain, { borderBottomColor: colors.borderLight }]}>
                  <Text style={[styles.insightText, { color: colors.text }]}>
                    {dashboard.dailyInsight.mainInsight}
                  </Text>
                </View>
                <View style={styles.insightTips}>
                  {dashboard.dailyInsight.tips.map((tip, i) => (
                    <View key={i} style={styles.tipRow}>
                      <Icon name="ellipse" size="sm" color={colors.primary} />
                      <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip.text}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity onPress={() => router.push('/(tabs)/heally')} style={styles.insightAction}>
                  <Text style={[styles.insightActionText, { color: colors.primary }]}>
                    Tanya lebih lanjut ke Heally
                  </Text>
                  <Icon name="arrow-forward" size="sm" color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Jadwal hari ini</Text>
              <View style={styles.sectionRight}>
                <Text style={[styles.progressText, { color: colors.primary }]}>
                  {progress?.done ?? 0}/{progress?.total ?? 0}
                </Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/schedule')}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>Semua</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${pct}%` as any }]} />
            </View>

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
                  style={[styles.emptyCard, { borderColor: colors.border }]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundElement }]}>
                    <Icon name="calendar-outline" size="md" color={colors.textMuted} />
                  </View>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Belum ada jadwal. Tap untuk generate AI.
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={[styles.section, { marginBottom: Spacing.xxxl }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Rekam medis</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/records')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>Semua</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.itemsList}>
              {dashboard?.recentRecords && dashboard.recentRecords.length > 0 ? (
                dashboard.recentRecords.map((rec) => (
                  <MedicalRecordCard key={rec.id} record={rec} compact />
                ))
              ) : (
                <View style={[styles.emptyCard, { borderColor: colors.border }]}>
                  <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundElement }]}>
                    <Icon name="clipboard-outline" size="md" color={colors.textMuted} />
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
  loadingText: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
  headerContent: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, paddingBottom: Spacing.xl },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  greeting: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
  userName: { fontSize: FontSize.xxl, fontFamily: Fonts.bold, letterSpacing: -0.6 },
  todayText: { fontSize: FontSize.xs, marginBottom: 16, fontFamily: Fonts.regular },
  bellBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  nextCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: BorderRadius.lg,
  },
  nextIcon: {
    width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center',
  },
  nextHint: { color: 'rgba(255,255,255,0.65)', fontSize: 10, fontFamily: Fonts.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  nextLabel: { color: 'white', fontSize: FontSize.sm, fontFamily: Fonts.bold, lineHeight: 18 },
  nextDetail: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, fontFamily: Fonts.regular },
  body: { padding: Spacing.lg, gap: Spacing.xl },
  uploadCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: BorderRadius.md, padding: Spacing.base, borderWidth: 1,
  },
  uploadIcon: {
    width: 36, height: 36, borderRadius: BorderRadius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  uploadTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold, marginBottom: 2 },
  uploadDesc: { fontSize: FontSize.xs, lineHeight: 18, fontFamily: Fonts.regular },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionIcon: { width: 24, height: 24, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: FontSize.lg, fontFamily: Fonts.bold, letterSpacing: -0.3 },
  seeAll: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  progressText: { fontSize: FontSize.xs, fontFamily: Fonts.bold },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full, borderWidth: 1 },
  badgeText: { fontSize: 10, fontFamily: Fonts.medium },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  itemsList: { gap: 10 },
  insightCard: { borderRadius: BorderRadius.md, borderWidth: 1, overflow: 'hidden' },
  insightMain: { padding: Spacing.base, borderBottomWidth: 1 },
  insightText: { fontSize: FontSize.sm, lineHeight: 22, fontFamily: Fonts.regular },
  insightTips: { padding: Spacing.base, gap: 10 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  tipText: { fontSize: FontSize.xs, lineHeight: 18, flex: 1, fontFamily: Fonts.regular },
  insightAction: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.base, paddingBottom: Spacing.base,
  },
  insightActionText: { fontSize: FontSize.xs, fontFamily: Fonts.bold },
  emptyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.base, borderRadius: BorderRadius.md, borderWidth: 1,
  },
  emptyIcon: { width: 36, height: 36, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: FontSize.xs, lineHeight: 18, flex: 1, fontFamily: Fonts.regular },
});
