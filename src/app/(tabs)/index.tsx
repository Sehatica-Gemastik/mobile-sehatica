import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, useColorScheme, Modal,
  Pressable, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '@/services/schedule.service';
import { recordsService } from '@/services/records.service';
import { dailyLogsService } from '@/services/daily-logs.service';
import { screeningService } from '@/services/screening.service';
import { scheduleRemindersService } from '@/services/schedule-reminders.service';
import { dailySyncService } from '@/services/daily-sync.service';
import { localDateKey } from '@/utils/local-date';
import { useAuthStore } from '@/store/auth-store';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { ScheduleItemCard } from '@/components/schedule-item';
import { MedicalRecordCard } from '@/components/medical-record-card';
import { Button, Icon, scheduleIcons } from '@/components/ui';
import { DailyLog, DailyLogType, ScheduleItem } from '@/types';

const LOG_TYPES: { type: DailyLogType; label: string; scheduleIcon: string }[] = [
  { type: 'food', label: 'Makan', scheduleIcon: 'food' },
  { type: 'medication', label: 'Obat', scheduleIcon: 'pill' },
  { type: 'exercise', label: 'Olahraga', scheduleIcon: 'exercise' },
  { type: 'water', label: 'Minum', scheduleIcon: 'water' },
];

const LOG_TITLES: Record<DailyLogType, string> = {
  food: 'Makan',
  medication: 'Minum obat',
  exercise: 'Olahraga',
  water: 'Minum air',
};

export default function HomeScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const today = localDateKey();

  useEffect(() => {
    void dailySyncService.sync(today, { checkResume: false }).catch(() => null);
  }, [today]);

  const [showLogModal, setShowLogModal] = useState(false);
  const [logType, setLogType] = useState<DailyLogType>('food');
  const [logTitle, setLogTitle] = useState(LOG_TITLES.food);
  const [logQuantity, setLogQuantity] = useState('');
  const [logDetail, setLogDetail] = useState('');
  const [logTime, setLogTime] = useState('');

  const {
    data: recentRecords = [],
    isLoading: isRecordsLoading,
    isRefetching: isRecordsRefetching,
    refetch: refetchRecords,
  } = useQuery({
    queryKey: ['records', 'recent'],
    queryFn: async () => (await recordsService.getAll()).slice(0, 3),
  });

  const {
    data: dailyLogs = [],
    isRefetching: isLogsRefetching,
    refetch: refetchLogs,
  } = useQuery({
    // ponytail: today-only feed; add date history when users need retrospective browsing.
    queryKey: ['dailyLogs', today],
    queryFn: () => dailyLogsService.getForDate(today),
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

  const {
    data: latestScreening,
    isRefetching: isScreeningRefetching,
    refetch: refetchScreening,
  } = useQuery({
    queryKey: ['screening', 'latest'],
    queryFn: screeningService.latest,
  });

  const toggleMutation = useMutation({
    mutationFn: scheduleService.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  const createLogMutation = useMutation({
    mutationFn: dailyLogsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLogs'] });
      setShowLogModal(false);
      setLogQuantity('');
      setLogDetail('');
    },
    onError: (error: Error) => Alert.alert('Gagal', error.message),
  });

  const deleteLogMutation = useMutation({
    mutationFn: dailyLogsService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dailyLogs'] }),
    onError: (error: Error) => Alert.alert('Gagal', error.message),
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

  const openLog = (type: DailyLogType) => {
    const now = new Date();
    setLogType(type);
    setLogTitle(LOG_TITLES[type]);
    setLogTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    setShowLogModal(true);
  };

  const confirmDeleteLog = (log: DailyLog) => Alert.alert(
    'Hapus catatan?',
    log.title,
    [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => deleteLogMutation.mutate(log.id) },
    ]
  );

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

  if (isRecordsLoading && isSchedulesLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat dashboard...</Text>
        </SafeAreaView>
      </View>
    );
  }

  const doneCount = todaySchedule.filter((item) => item.done).length;
  const pct = todaySchedule.length > 0
    ? Math.round((doneCount / todaySchedule.length) * 100)
    : 0;
  const nextItem = todaySchedule.find((item) => !item.done) ?? null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl
            refreshing={isRecordsRefetching || isSchedulesRefetching || isLogsRefetching || isScreeningRefetching}
            onRefresh={() => Promise.all([
              refetchRecords(), refetchSchedules(), refetchLogs(), refetchScreening(),
            ]).then(() => undefined)}
            tintColor={colors.primary}
          />
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
                  accessibilityLabel="Aktifkan pengingat jadwal hari ini"
                  onPress={() => {
                    if (todaySchedule.length === 0) {
                      Alert.alert('Belum ada jadwal', 'Tambahkan jadwal sebelum mengaktifkan pengingat.');
                      return;
                    }
                    reminderMutation.mutate();
                  }}
                  disabled={reminderMutation.isPending}
                  style={[styles.bellBtn, { backgroundColor: colors.backgroundElement }]}
                  activeOpacity={0.7}
                >
                  {reminderMutation.isPending
                    ? <ActivityIndicator size="small" color={colors.primary} />
                    : <Icon name="notifications-outline" size="md" color={colors.text} />}
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
          {recentRecords.length === 0 && (
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

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/screening')}
            style={[styles.screeningCard, { borderColor: colors.border }]}
            activeOpacity={0.8}
          >
            <View style={[styles.screeningIcon, { backgroundColor: colors.blueLight }]}>
              <Icon name="pulse-outline" size="md" color={colors.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.screeningTitle, { color: colors.text }]}>Screening risiko PTM</Text>
              <Text style={[styles.screeningDesc, { color: colors.textSecondary }]}>
                {latestScreening
                  ? latestScreening.factors.length > 0
                    ? `${latestScreening.factors.length} faktor perlu diperhatikan`
                    : 'Tidak ada faktor yang dilaporkan pada hasil terakhir'
                  : 'Kenali faktor risiko melalui checklist singkat'}
              </Text>
            </View>
            <Icon name="chevron-forward" size="sm" color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Catatan hari ini</Text>
              <Text style={[styles.progressText, { color: colors.primary }]}>{dailyLogs.length} aktivitas</Text>
            </View>
            <View style={styles.quickLogs}>
              {LOG_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.type}
                  accessibilityLabel={`Catat ${item.label.toLowerCase()}`}
                  onPress={() => openLog(item.type)}
                  style={[styles.quickLogButton, { backgroundColor: colors.backgroundElement }]}
                  activeOpacity={0.7}
                >
                  <Icon name={scheduleIcons[item.scheduleIcon]} size="md" color={colors.primary} />
                  <Text style={[styles.quickLogLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {dailyLogs.map((log) => {
              const iconKey = log.type === 'medication' ? 'pill' : log.type;
              return (
                <TouchableOpacity
                  key={log.id}
                  onLongPress={() => confirmDeleteLog(log)}
                  accessibilityHint="Tekan lama untuk menghapus catatan"
                  style={[styles.dailyLogCard, { borderColor: colors.border }]}
                  activeOpacity={0.75}
                >
                  <View style={[styles.dailyLogIcon, { backgroundColor: colors.primaryLight }]}>
                    <Icon name={scheduleIcons[iconKey] ?? scheduleIcons.other} size="sm" color={colors.primary} />
                  </View>
                  <View style={styles.dailyLogContent}>
                    <Text style={[styles.dailyLogTitle, { color: colors.text }]}>{log.title}</Text>
                    {log.quantity || log.detail ? (
                      <Text style={[styles.dailyLogDetail, { color: colors.textSecondary }]} numberOfLines={1}>
                        {[log.quantity, log.detail].filter(Boolean).join(' · ')}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.dailyLogTime, { color: colors.textMuted }]}>{log.time}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Jadwal hari ini</Text>
              <View style={styles.sectionRight}>
                <Text style={[styles.progressText, { color: colors.primary }]}>
                  {doneCount}/{todaySchedule.length}
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
              {todaySchedule.length > 0 ? (
                todaySchedule.slice(0, 5).map((item: ScheduleItem) => (
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
              {recentRecords.length > 0 ? (
                recentRecords.map((rec) => (
                  <MedicalRecordCard
                    key={rec.id}
                    record={rec}
                    compact
                    onPress={() => router.push(`/record/${rec.id}`)}
                  />
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

      <Modal visible={showLogModal} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowLogModal(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: colors.backgroundCard }]} onPress={() => {}}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Catat {LOG_TITLES[logType].toLowerCase()}</Text>
              <TouchableOpacity
                accessibilityLabel="Tutup"
                onPress={() => setShowLogModal(false)}
                style={[styles.closeButton, { backgroundColor: colors.backgroundElement }]}
              >
                <Icon name="close" size="sm" color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.logInput, { borderColor: colors.border, color: colors.text }]}
              placeholder="Nama aktivitas"
              placeholderTextColor={colors.textMuted}
              value={logTitle}
              onChangeText={setLogTitle}
            />
            <TextInput
              style={[styles.logInput, { borderColor: colors.border, color: colors.text }]}
              placeholder={logType === 'exercise' ? 'Durasi, mis. 30 menit' : 'Jumlah, mis. 500 ml / 1 porsi'}
              placeholderTextColor={colors.textMuted}
              value={logQuantity}
              onChangeText={setLogQuantity}
            />
            <TextInput
              style={[styles.logInput, { borderColor: colors.border, color: colors.text }]}
              placeholder="Detail (opsional)"
              placeholderTextColor={colors.textMuted}
              value={logDetail}
              onChangeText={setLogDetail}
            />
            <TextInput
              style={[styles.logInput, { borderColor: colors.border, color: colors.text }]}
              placeholder="07:00"
              placeholderTextColor={colors.textMuted}
              value={logTime}
              onChangeText={setLogTime}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
            {logType === 'medication' ? (
              <Text style={[styles.medicationHint, { color: colors.textMuted }]}>
                Catat obat sesuai resep atau instruksi tenaga kesehatan.
              </Text>
            ) : null}
            <Button
              label="Simpan di perangkat"
              loadingLabel="Menyimpan catatan..."
              onPress={() => {
                const title = logTitle.trim();
                const time = logTime.trim();
                if (!title) {
                  Alert.alert('Belum lengkap', 'Nama aktivitas wajib diisi.');
                  return;
                }
                if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
                  Alert.alert('Format waktu salah', 'Gunakan format HH:MM, contoh 07:30.');
                  return;
                }
                createLogMutation.mutate({
                  type: logType,
                  title,
                  quantity: logQuantity.trim() || undefined,
                  detail: logDetail.trim() || undefined,
                  logDate: today,
                  time,
                });
              }}
              loading={createLogMutation.isPending}
              disabled={createLogMutation.isPending}
              fullWidth
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  screeningCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: BorderRadius.md, padding: Spacing.base, borderWidth: 1,
  },
  screeningIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  screeningTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold, marginBottom: 2 },
  screeningDesc: { fontSize: FontSize.xs, lineHeight: 18, fontFamily: Fonts.regular },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: FontSize.lg, fontFamily: Fonts.bold, letterSpacing: -0.3 },
  seeAll: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  progressText: { fontSize: FontSize.xs, fontFamily: Fonts.bold },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  itemsList: { gap: 10 },
  quickLogs: { flexDirection: 'row', gap: 8 },
  quickLogButton: {
    flex: 1, minHeight: 72, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  quickLogLabel: { fontSize: 10, fontFamily: Fonts.medium },
  dailyLogCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: BorderRadius.md, borderWidth: 1,
  },
  dailyLogIcon: {
    width: 32, height: 32, borderRadius: BorderRadius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  dailyLogContent: { flex: 1, gap: 2 },
  dailyLogTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  dailyLogDetail: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  dailyLogTime: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xl, paddingBottom: 40, gap: Spacing.base,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: FontSize.lg, fontFamily: Fonts.bold },
  closeButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  logInput: {
    borderWidth: 1, borderRadius: BorderRadius.md,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: FontSize.sm, fontFamily: Fonts.regular,
  },
  medicationHint: { fontSize: FontSize.xs, lineHeight: 18, fontFamily: Fonts.regular },
  emptyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.base, borderRadius: BorderRadius.md, borderWidth: 1,
  },
  emptyIcon: { width: 36, height: 36, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: FontSize.xs, lineHeight: 18, flex: 1, fontFamily: Fonts.regular },
});
