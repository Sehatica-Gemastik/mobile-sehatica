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
import { appointmentsService, PatientAppointment } from '@/services/appointments.service';
import { scheduleRemindersService } from '@/services/schedule-reminders.service';
import { dailySyncService } from '@/services/daily-sync.service';
import { localDateKey } from '@/utils/local-date';
import { useAuthStore } from '@/store/auth-store';
import {
  selectDailyDoneToday, selectWeeklyDue, useLifestyleStore,
} from '@/store/lifestyle-store';
import { daysSince } from '@/features/lifestyle/derived';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, BottomTabInset } from '@/constants/theme';
import { useScreenTopPadding } from '@/hooks/use-screen-top-padding';
import { Icon, InitialsAvatar } from '@/components/ui';
import { ActionCardStack, ActionCardItem } from '@/components/dashboard/action-card-stack';
import { ScheduleStack } from '@/components/dashboard/schedule-stack';
import { RiskCard } from '@/components/dashboard/risk-card';
import { buildPtmPayload, emptyPtmRiskResult, getPtmReadiness } from '@/features/ptm/build-payload';
import { userHasIdentity, userToIdentityProfile } from '@/features/identity/user-identity';
import { ptmRiskService } from '@/services/ptm-risk.service';

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
  const identity = userToIdentityProfile(user);
  const hasIdentity = userHasIdentity(user);
  const weekly = useLifestyleStore((state) => state.weekly);
  const daily = useLifestyleStore((state) => state.daily);
  const weeklyDue = useLifestyleStore(selectWeeklyDue);
  const dailyDone = useLifestyleStore(selectDailyDoneToday);

  useEffect(() => {
    void dailySyncService.sync(today).catch(() => null);
  }, [today]);

  const ptmPayload = useMemo(
    () => buildPtmPayload(identity, daily, weekly),
    [identity, daily, weekly],
  );

  const ptmReadiness = useMemo(
    () => getPtmReadiness(ptmPayload),
    [ptmPayload],
  );

  useEffect(() => {
    if (!__DEV__) return;
    console.log('[ptm-debug] hasIdentity:', hasIdentity);
    console.log('[ptm-debug] user identity fields:', {
      age: user?.age, sex: user?.sex,
      race: user?.race_ethnicity, edu: user?.education, income: user?.income_poverty_ratio,
      identityComplete: user?.identityComplete,
    });
    console.log('[ptm-debug] identity profile:', identity);
    console.log('[ptm-debug] daily exists:', !!daily, daily ? {
      date: daily.date,
      sedentary_minutes: daily.sedentary_minutes,
      vigorous_work: daily.vigorous_work,
      calories_day1: daily.calories_day1,
      mealsCount: daily.meals?.length ?? 0,
      mealIds: (daily.meals ?? []).map((m) => m.foodId),
      nutritionManual: daily.nutritionManual,
      completedAt: daily.completedAt,
    } : 'null');
    console.log('[ptm-debug] weekly exists:', !!weekly);
    console.log('[ptm-debug] payload critical:', {
      age: ptmPayload.age, sex: ptmPayload.sex,
      race: ptmPayload.race_ethnicity, edu: ptmPayload.education, income: ptmPayload.income_poverty_ratio,
      sedentary: ptmPayload.sedentary_minutes, vigorous: ptmPayload.vigorous_work,
      cal: ptmPayload.calories_day1,
    });
    console.log('[ptm-debug] readiness:', ptmReadiness);
    console.log('[ptm-debug] query enabled:', hasIdentity && ptmReadiness.ready);
  }, [hasIdentity, user, identity, daily, weekly, ptmPayload, ptmReadiness]);

  const { data: ptmRisk, isLoading: isPtmLoading, isError: isPtmError } = useQuery({
    queryKey: ['ptm-risk', ptmPayload],
    queryFn: () => ptmRiskService.predict(ptmPayload),
    enabled: hasIdentity && ptmReadiness.ready,
    staleTime: 1000 * 60 * 30,
  });

  const riskData = ptmRisk ?? emptyPtmRiskResult();

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

  const { data: allAppointments = [] } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: () => appointmentsService.list(),
    placeholderData: [],
    staleTime: 1000 * 60 * 5,
  });

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const todayAppointments = allAppointments
    .filter((a) => {
      const t = new Date(a.start).getTime();
      return t >= todayStart.getTime() && t <= todayEnd.getTime();
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

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
        subtitle: 'Upload PDF rekam medis dari kunjungan dokter.',
        icon: 'cloud-upload-outline',
        status: 'pending',
        onPress: () => router.push('/(tabs)/records'),
      });
    }

    return cards;
  }, [dailyDone, recordCount, weekly, weeklyAge, weeklyDue]);

  const heroText = {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.88)',
  };

  if (isRecordsLoading && isSchedulesLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.loadingContainer, { paddingTop: topPadding }]}>
          <ActivityIndicator color="#FFFFFF" />
          <Text style={[styles.loadingText, { color: heroText.secondary }]}>Memuat dashboard...</Text>
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
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ['ptm-risk'] });
              return Promise.all([refetchRecords(), refetchSchedules()]).then(() => undefined);
            }}
            tintColor="#FFFFFF"
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
            <InitialsAvatar
              initials={user?.avatarInitials}
              name={user?.name}
              size="lg"
            />
            <View style={styles.headerText}>
              <Text style={[styles.userName, { color: heroText.primary }]} numberOfLines={1}>
                {user?.name ?? 'Pengguna'}
              </Text>
              <Text style={[styles.todayText, { color: heroText.secondary }]}>{todayLabel}</Text>
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
            style={[styles.bellBtn, styles.bellBtnOnGradient]}
            activeOpacity={0.7}
          >
            {reminderMutation.isPending
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Icon name="notifications-outline" size="md" color="#FFFFFF" />}
          </TouchableOpacity>
        </View>

        <View style={styles.heroContent}>
          {hasIdentity ? (
            <View style={styles.riskWrap}>
              <RiskCard
                data={riskData}
                isLoading={isPtmLoading}
                isError={isPtmError}
                readinessReason={ptmReadiness.reason}
              />
            </View>
          ) : null}
          <ActionCardStack cards={actionCards} onGradient />
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

          {todayAppointments.length > 0 ? (
            <View style={styles.appointmentsSection}>
              <View style={styles.appointmentsSectionHeader}>
                <Text style={[styles.appointmentsSectionTitle, { color: colors.text }]}>
                  Janji hari ini
                </Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/schedule')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[styles.appointmentsSeeAll, { color: colors.primary }]}>Lihat semua</Text>
                </TouchableOpacity>
              </View>
              {todayAppointments.map((item: PatientAppointment) => {
                const startDate = new Date(item.start);
                const timeStr = startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.appointmentRow, { backgroundColor: colors.backgroundElement }]}
                    onPress={() => router.push('/(tabs)/schedule')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.appointmentDot, { backgroundColor: colors.primary }]} />
                    <View style={styles.appointmentRowBody}>
                      <Text style={[styles.appointmentRowTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={[styles.appointmentRowMeta, { color: colors.textMuted }]}>
                        {timeStr} · {item.doctorName}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
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
  headerText: { flex: 1, gap: 2 },
  userName: { fontSize: FontSize.xl, fontFamily: Fonts.bold, letterSpacing: -0.4 },
  todayText: { fontSize: FontSize.xs, fontFamily: Fonts.regular, marginTop: 2 },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBtnOnGradient: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  heroContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  riskWrap: {
    marginBottom: 0,
  },
  scheduleSheet: {
    flexGrow: 1,
    marginTop: -8,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingTop: Spacing.xl + 4,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
  appointmentsSection: { gap: 8 },
  appointmentsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appointmentsSectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.bold,
    letterSpacing: -0.3,
  },
  appointmentsSeeAll: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
  },
  appointmentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  appointmentRowBody: { flex: 1, gap: 2 },
  appointmentRowTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  appointmentRowMeta: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
});
