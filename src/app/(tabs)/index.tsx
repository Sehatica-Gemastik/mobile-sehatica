import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, useColorScheme, Alert,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '@/services/schedule.service';
import { recordsService } from '@/services/records.service';
import { scheduleRemindersService } from '@/services/schedule-reminders.service';
import { dailySyncService } from '@/services/daily-sync.service';
import { localDateKey } from '@/utils/local-date';
import { useAuthStore } from '@/store/auth-store';
import {
  selectDailyDoneToday, selectWeeklyDue, useLifestyleStore,
} from '@/store/lifestyle-store';
import { daysSince } from '@/features/lifestyle/derived';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, Shadows, BottomTabInset } from '@/constants/theme';
import { useScreenTopPadding } from '@/hooks/use-screen-top-padding';
import { Icon } from '@/components/ui';
import { ActionCardStack, ActionCardItem } from '@/components/dashboard/action-card-stack';
import { ScheduleStack } from '@/components/dashboard/schedule-stack';

export default function HomeScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const topPadding = useScreenTopPadding();
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [heroHeight, setHeroHeight] = useState(0);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const today = localDateKey();
  const weekly = useLifestyleStore((state) => state.weekly);
  const weeklyDue = useLifestyleStore(selectWeeklyDue);
  const dailyDone = useLifestyleStore(selectDailyDoneToday);

  useEffect(() => {
    void dailySyncService.sync(today).catch(() => null);
  }, [today]);

  const {
    data: recordCount = 0,
    isLoading: isRecordsLoading,
    isRefetching: isRecordsRefetching,
    refetch: refetchRecords,
  } = useQuery({
    queryKey: ['records', 'count'],
    queryFn: async () => (await recordsService.getAll()).length,
  });

  const {
    data: todaySchedule = [],
    isLoading: isSchedulesLoading,
    isRefetching: isSchedulesRefetching,
    refetch: refetchSchedules,
  } = useQuery({
    queryKey: ['schedules', today],
    queryFn: () => scheduleService.getForDate(today),
  });

  const reminderMutation = useMutation({
    mutationFn: () => scheduleRemindersService.sync(todaySchedule),
    onSuccess: (count) => Alert.alert(
      'Pengingat diperbarui',
      count > 0
        ? `${count} aktivitas hari ini akan diingatkan secara lokal.`
        : 'Tidak ada aktivitas mendatang yang perlu diingatkan.'
    ),
    onError: (error: Error) => Alert.alert('Pengingat belum aktif', error.message),
  });

  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const weeklyAge = weekly ? daysSince(weekly.completedAt) : null;

  const actionCards = useMemo(() => {
    const cards: ActionCardItem[] = [];

    if (weeklyDue) {
      cards.push({
        id: 'weekly',
        title: weekly ? 'Saatnya update data tubuh' : 'Lengkapi data tubuh',
        subtitle: weekly && weeklyAge != null
          ? `Terakhir diisi ${weeklyAge} hari lalu. Perbarui berat, tinggi, dan tekanan darah.`
          : 'Isi berat, tinggi, pinggang, dan tekanan darah sekali, lalu update tiap minggu.',
        icon: 'body-outline',
        status: 'pending',
        onPress: () => router.push('/weekly-checkin'),
      });
    } else if (weekly) {
      cards.push({
        id: 'weekly-done',
        title: 'Data tubuh minggu ini',
        subtitle: `BMI ${weekly.bmi} · ${Math.round(weekly.systolic_bp)}/${Math.round(weekly.diastolic_bp)} mmHg`,
        icon: 'body-outline',
        status: 'done',
        onPress: () => router.push('/weekly-checkin'),
      });
    }

    cards.push({
      id: 'daily',
      title: dailyDone ? 'Kuisioner hari ini sudah diisi' : 'Isi kuisioner hari ini',
      subtitle: dailyDone
        ? 'Aktivitas, nutrisi, dan alkohol tersimpan. Tap untuk mengubah.'
        : 'Beberapa pertanyaan singkat tentang aktivitas, makan, dan alkohol.',
      icon: dailyDone ? 'checkmark-circle-outline' : 'clipboard-outline',
      status: dailyDone ? 'done' : 'pending',
      onPress: () => router.push('/daily-checkin'),
    });

    if (recordCount === 0) {
      cards.push({
        id: 'records',
        title: 'Rekam medis perlu diperbarui',
        subtitle: 'Upload hasil kunjungan agar rekam medis tetap akurat.',
        icon: 'cloud-upload-outline',
        status: 'pending',
        onPress: () => router.push('/(tabs)/records'),
      });
    }

    return cards;
  }, [dailyDone, recordCount, weekly, weeklyAge, weeklyDue]);

  if (isRecordsLoading && isSchedulesLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.loadingContainer, { paddingTop: topPadding }]}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat dashboard...</Text>
        </View>
      </View>
    );
  }

  const doneCount = todaySchedule.filter((item) => item.done).length;

  const tabBarHeight = BottomTabInset + 52;
  const scheduleMinHeight = heroHeight > 0
    ? Math.max(240, windowHeight - heroHeight - tabBarHeight - insets.bottom + 8)
    : Math.max(360, windowHeight * 0.52);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRecordsRefetching || isSchedulesRefetching}
            onRefresh={() => Promise.all([
              refetchRecords(), refetchSchedules(),
            ]).then(() => undefined)}
            tintColor={colors.primary}
          />
        }
      >
        <View
          onLayout={(e) => setHeroHeight(e.nativeEvent.layout.height)}
        >
          <View style={[styles.header, { paddingTop: topPadding }]}>
          <TouchableOpacity
            onPress={() => router.push('/account')}
            activeOpacity={0.8}
            style={styles.headerLeft}
          >
            <View style={styles.avatar}>
              <Icon name="person-outline" size="lg" color="#9CA3AF" />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {user?.name ?? 'Pengguna'}
              </Text>
              <Text style={[styles.todayText, { color: colors.textMuted }]}>{todayLabel}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Aktifkan pengingat jadwal hari ini"
            onPress={() => {
              if (todaySchedule.length === 0) {
                Alert.alert('Belum ada jadwal', 'Tambahkan jadwal sebelum mengaktifkan pengingat.');
                return;
              }
              reminderMutation.mutate();
            }}
            disabled={reminderMutation.isPending}
            style={[styles.bellBtn, Shadows.sm, { backgroundColor: colors.backgroundCard }]}
            activeOpacity={0.7}
          >
            {reminderMutation.isPending
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Icon name="notifications-outline" size="md" color={colors.text} />}
          </TouchableOpacity>
        </View>

        <View style={styles.heroContent}>
          <ActionCardStack cards={actionCards} />
        </View>
        </View>

        <View style={[
          styles.scheduleSheet,
          { backgroundColor: colors.backgroundCard, minHeight: scheduleMinHeight },
        ]}>
          <ScheduleStack
            items={todaySchedule}
            doneCount={doneCount}
            onItemPress={() => router.push('/(tabs)/schedule')}
            onSeeAll={() => router.push('/(tabs)/schedule')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  userName: { fontSize: FontSize.xl, fontFamily: Fonts.bold, letterSpacing: -0.4 },
  todayText: { fontSize: FontSize.xs, fontFamily: Fonts.regular, marginTop: 2 },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  scheduleSheet: {
    flexGrow: 1,
    marginTop: -8,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingTop: Spacing.xl + 4,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
});
