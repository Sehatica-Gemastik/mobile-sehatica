import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, useColorScheme,
  useWindowDimensions, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { recordsService } from '@/services/records.service';
import { appointmentsService, PatientAppointment } from '@/services/appointments.service';
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
import { RiskCard } from '@/components/dashboard/risk-card';
import { buildPtmPayload, emptyPtmRiskResult, getPtmReadiness } from '@/features/ptm/build-payload';
import { userHasIdentity, userToIdentityProfile } from '@/features/identity/user-identity';
import { ptmRiskService } from '@/services/ptm-risk.service';
import { syncSehaticaWidget } from '@/widgets/sync-widget';

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
    data: allAppointments = [],
    isLoading: isAppointmentsLoading,
    isRefetching: isAppointmentsRefetching,
    refetch: refetchAppointments,
  } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: () => appointmentsService.list(),
    placeholderData: [],
    staleTime: 1000 * 60 * 5,
  });

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, [today]);
  const todayEnd = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, [today]);

  const todayAppointments = useMemo(
    () => allAppointments
      .filter((a) => {
        const t = new Date(a.start).getTime();
        return t >= todayStart && t <= todayEnd;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [allAppointments, todayStart, todayEnd],
  );

  useEffect(() => {
    void syncSehaticaWidget({
      signedIn: true,
      userName: user?.name ?? null,
      dailyDone,
      weeklyDue,
      ptmRisk: ptmRisk ?? null,
      appointmentsToday: todayAppointments,
    });
  }, [user?.name, dailyDone, weeklyDue, ptmRisk, todayAppointments]);

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

  if (isRecordsLoading && isAppointmentsLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.loadingContainer, { paddingTop: topPadding }]}>
          <ActivityIndicator color="#FFFFFF" />
          <Text style={[styles.loadingText, { color: heroText.secondary }]}>Memuat dashboard...</Text>
        </View>
      </View>
    );
  }

  const tabBarHeight = BottomTabInset + 52;
  const sheetMinHeight = heroHeight > 0
    ? Math.max(240, windowHeight - heroHeight - tabBarHeight - insets.bottom + 8)
    : Math.max(360, windowHeight * 0.52);

  const renderAppointmentRow = (item: PatientAppointment) => {
    const startDate = new Date(item.start);
    const endDate = new Date(item.end);
    const timeStr = `${startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.appointmentRow, { backgroundColor: colors.backgroundElement }]}
        onPress={() => router.push('/(tabs)/schedule')}
        activeOpacity={0.8}
      >
        <View style={[styles.appointmentIcon, { backgroundColor: colors.primaryLight }]}>
          <Icon name="calendar-outline" size="sm" color={colors.primary} />
        </View>
        <View style={styles.appointmentRowBody}>
          <Text style={[styles.appointmentRowTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.appointmentRowMeta, { color: colors.textMuted }]}>
            {timeStr} · {item.doctorName}
          </Text>
          {item.notes ? (
            <Text style={[styles.appointmentRowNotes, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.notes}
            </Text>
          ) : null}
        </View>
        <Icon name="chevron-forward" size="sm" color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRecordsRefetching || isAppointmentsRefetching}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ['ptm-risk'] });
              return Promise.all([refetchRecords(), refetchAppointments()]).then(() => undefined);
            }}
            tintColor="#FFFFFF"
          />
        }
      >
        <View onLayout={(e) => setHeroHeight(e.nativeEvent.layout.height)}>
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
          styles.appointmentsSheet,
          { backgroundColor: colors.backgroundCard, minHeight: sheetMinHeight },
        ]}>
          <View style={styles.appointmentsSectionHeader}>
            <Text style={[styles.appointmentsSectionTitle, { color: colors.text }]}>
              Janji hari ini
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/schedule')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.appointmentsSeeAll, { color: colors.primary }]}>
                {todayAppointments.length > 0 ? 'Lihat semua' : 'Buat janji'}
              </Text>
            </TouchableOpacity>
          </View>

          {todayAppointments.length === 0 ? (
            <Pressable
              onPress={() => router.push('/(tabs)/schedule')}
              style={styles.emptyAppointments}
            >
              <Icon name="calendar-outline" size="lg" color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum ada janji hari ini</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                Tap untuk buat appointment dengan dokter partner
              </Text>
            </Pressable>
          ) : (
            <View style={styles.appointmentsList}>
              {todayAppointments.map(renderAppointmentRow)}
            </View>
          )}
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
  heroContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  riskWrap: { marginBottom: 0 },
  appointmentsSheet: {
    flexGrow: 1,
    marginTop: -8,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingTop: Spacing.xl + 4,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
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
  appointmentsList: { gap: 8 },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
  },
  appointmentIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  appointmentRowBody: { flex: 1, gap: 2 },
  appointmentRowTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  appointmentRowMeta: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  appointmentRowNotes: { fontSize: FontSize.xs, fontFamily: Fonts.regular, marginTop: 1 },
  emptyAppointments: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  emptyTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  emptyDesc: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
});
