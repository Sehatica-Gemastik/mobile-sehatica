import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, ActivityIndicator, Alert,
  useColorScheme, Pressable, TextInput,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '@/services/schedule.service';
<<<<<<< Updated upstream
import { localDateKey } from '@/utils/local-date';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { ScheduleItemCard } from '@/components/schedule-item';
import { Button, Chip, EmptyState, Icon, ScreenHeader, scheduleIcons } from '@/components/ui';
import { ScheduleItem, ScheduleType } from '@/types';

const SCHEDULE_TYPES: { type: ScheduleType; label: string }[] = [
  { type: 'food', label: 'Makan' },
  { type: 'pill', label: 'Obat' },
  { type: 'exercise', label: 'Olahraga' },
  { type: 'water', label: 'Minum' },
  { type: 'other', label: 'Lainnya' },
=======
import { cancelReminderForItem, resyncRemindersForItems, scheduleReminderForItem } from '@/services/notifications.service';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { ScheduleItemCard } from '@/components/schedule-item';
import { Button, Chip, EmptyState, Icon, ScreenHeader, TextField, scheduleIcons } from '@/components/ui';
import { ScheduleItem, ScheduleType } from '@/types';

const TYPE_OPTIONS: Array<{ type: ScheduleType; label: string; colorScheme: string }> = [
  { type: 'food', label: 'Makan', colorScheme: 'orange' },
  { type: 'pill', label: 'Obat', colorScheme: 'blue' },
  { type: 'exercise', label: 'Olahraga', colorScheme: 'green' },
  { type: 'water', label: 'Minum air', colorScheme: 'cyan' },
  { type: 'other', label: 'Lainnya', colorScheme: 'purple' },
>>>>>>> Stashed changes
];

export default function ScheduleScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const queryClient = useQueryClient();
  const [showAIModal, setShowAIModal] = useState(false);
<<<<<<< Updated upstream
  const [showAddModal, setShowAddModal] = useState(false);
  const [type, setType] = useState<ScheduleType>('food');
  const [label, setLabel] = useState('');
  const [detail, setDetail] = useState('');
  const [time, setTime] = useState('07:00');
=======
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newType, setNewType] = useState<ScheduleType>('pill');
  const [newLabel, setNewLabel] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [newTime, setNewTime] = useState('');
>>>>>>> Stashed changes

  const today = localDateKey();
  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const { data: items = [], error, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['schedules', today],
    queryFn: () => scheduleService.getForDate(today),
  });

  // Sinkronkan reminder lokal tiap kali daftar hari ini berubah (mis. app baru
  // dibuka lagi) — device-local scheduling, tidak butuh trigger server.
  useEffect(() => {
    resyncRemindersForItems(items);
  }, [items]);

  const toggleMutation = useMutation({
    mutationFn: scheduleService.toggle,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
<<<<<<< Updated upstream
    },
  });

  const createMutation = useMutation({
    mutationFn: scheduleService.create,
    onSuccess: () => {
=======
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (updated.done) cancelReminderForItem(updated.id);
      else scheduleReminderForItem(updated);
    },
  });

  const aiGenerateMutation = useMutation({
    mutationFn: scheduleService.aiGenerate,
    onSuccess: (created) => {
>>>>>>> Stashed changes
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setShowAddModal(false);
      setType('food');
      setLabel('');
      setDetail('');
      setTime('07:00');
    },
    onError: (err: Error) => Alert.alert('Gagal', err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: scheduleService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
    onError: (err: Error) => Alert.alert('Gagal', err.message),
  });

  const aiGenerateMutation = useMutation({
    mutationFn: () => scheduleService.aiGenerate(today),
    onSuccess: ({ warnings }) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setShowAIModal(false);
<<<<<<< Updated upstream
      if (warnings.length > 0) {
        Alert.alert('Jadwal tersimpan', warnings.join('\n'));
      }
=======
      resyncRemindersForItems(created);
>>>>>>> Stashed changes
    },
    onError: (err: any) => Alert.alert('Gagal', err.message),
  });

  const resetCreateForm = () => {
    setNewType('pill');
    setNewLabel('');
    setNewDetail('');
    setNewTime('');
  };

  const createMutation = useMutation({
    mutationFn: scheduleService.create,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowCreateModal(false);
      resetCreateForm();
      scheduleReminderForItem(created);
    },
    onError: (err: any) => Alert.alert('Gagal', err.message ?? 'Gagal menambah jadwal'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await cancelReminderForItem(id);
      return scheduleService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: any) => Alert.alert('Gagal', err.message ?? 'Gagal menghapus jadwal'),
  });

  const handleCreateSubmit = () => {
    if (!newLabel.trim() || !newTime.trim()) {
      Alert.alert('Lengkapi dulu', 'Label dan waktu wajib diisi (format waktu: 08:00)');
      return;
    }
    const typeOption = TYPE_OPTIONS.find((t) => t.type === newType);
    createMutation.mutate({
      type: newType,
      label: newLabel.trim(),
      detail: newDetail.trim() || undefined,
      time: newTime.trim(),
      scheduleDate: today,
      colorScheme: typeOption?.colorScheme,
    });
  };

  const handleLongPressItem = (item: ScheduleItem) => {
    Alert.alert('Hapus jadwal', `Hapus "${item.label}" dari jadwal?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
    ]);
  };

  const done = items.filter((i: ScheduleItem) => i.done).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const categoryCounts = {
    food: items.filter((i: ScheduleItem) => i.type === 'food').length,
    pill: items.filter((i: ScheduleItem) => i.type === 'pill').length,
    exercise: items.filter((i: ScheduleItem) => i.type === 'exercise').length,
    water: items.filter((i: ScheduleItem) => i.type === 'water').length,
  };

  const confirmDelete = (item: ScheduleItem) => Alert.alert(
    'Hapus aktivitas?',
    item.label,
    [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
    ]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Jadwal harian"
        subtitle={todayLabel}
<<<<<<< Updated upstream
        right={<View style={styles.headerActions}>
          <TouchableOpacity
            accessibilityLabel="Tambah aktivitas"
            onPress={() => setShowAddModal(true)}
            style={[styles.addBtn, { backgroundColor: colors.backgroundElement }]}
            activeOpacity={0.8}
          >
            <Icon name="add" size="md" color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowAIModal(true)}
            style={[styles.aiBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Icon name="sparkles" size="sm" color={colors.onPrimary} />
            <Text style={styles.aiBtnText}>AI</Text>
          </TouchableOpacity>
        </View>}
=======
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              style={[styles.addBtn, { backgroundColor: colors.backgroundElement }]}
              activeOpacity={0.8}
              accessibilityLabel="Tambah jadwal"
            >
              <Icon name="add" size="sm" color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowAIModal(true)}
              style={[styles.aiBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Icon name="sparkles" size="sm" color={colors.onPrimary} />
              <Text style={styles.aiBtnText}>AI Generate</Text>
            </TouchableOpacity>
          </View>
        }
>>>>>>> Stashed changes
      >
        <View style={styles.progressBlock}>
          <View style={styles.progressRow}>
            <View style={[styles.progressBarBg, { backgroundColor: colors.backgroundElement }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${pct}%` as any }]} />
            </View>
            <Text style={[styles.progressPct, { color: colors.primary }]}>{pct}%</Text>
          </View>
          <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
            {done} dari {total} aktivitas selesai
          </Text>
        </View>
      </ScreenHeader>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {total > 0 && (
            <View style={styles.categories}>
              {(
                [
                  { type: 'food', count: categoryCounts.food },
                  { type: 'pill', count: categoryCounts.pill },
                  { type: 'exercise', count: categoryCounts.exercise },
                  { type: 'water', count: categoryCounts.water },
                ] as const
              )
                .filter((c) => c.count > 0)
                .map((cat) => (
                  <View key={cat.type} style={[styles.categoryPill, { backgroundColor: colors.backgroundElement }]}>
                    <Icon name={scheduleIcons[cat.type]} size="sm" color={colors.textSecondary} />
                    <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>{cat.count}</Text>
                  </View>
                ))}
            </View>
          )}

          {error ? (
            <EmptyState
              icon="alert-circle-outline"
              title="Jadwal lokal tidak tersedia"
              description={error instanceof Error ? error.message : 'Coba buka kembali aplikasi.'}
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="Belum ada jadwal hari ini"
              description="Tambahkan aktivitas sendiri atau buat rekomendasi dengan AI"
              actionLabel="Tambah aktivitas"
              onAction={() => setShowAddModal(true)}
            />
          ) : (
            <View style={styles.itemsList}>
              {items.map((item: ScheduleItem) => (
                <ScheduleItemCard
                  key={item.id}
                  item={item}
                  onToggle={() => toggleMutation.mutate(item.id)}
<<<<<<< Updated upstream
                  onLongPress={() => confirmDelete(item)}
=======
                  onLongPress={() => handleLongPressItem(item)}
>>>>>>> Stashed changes
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <Modal visible={showAddModal} animationType="slide" transparent>
        <Pressable style={styles.overlay} onPress={() => setShowAddModal(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: colors.backgroundCard }]} onPress={() => {}}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Tambah aktivitas</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={[styles.closeBtn, { backgroundColor: colors.backgroundElement }]}
              >
                <Icon name="close" size="sm" color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.typeWrap}>
              {SCHEDULE_TYPES.map((option) => (
                <Chip
                  key={option.type}
                  label={option.label}
                  active={type === option.type}
                  onPress={() => setType(option.type)}
                />
              ))}
            </View>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Nama aktivitas"
              placeholderTextColor={colors.textMuted}
              value={label}
              onChangeText={setLabel}
            />
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Detail (opsional)"
              placeholderTextColor={colors.textMuted}
              value={detail}
              onChangeText={setDetail}
            />
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="07:00"
              placeholderTextColor={colors.textMuted}
              value={time}
              onChangeText={setTime}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
            {type === 'pill' ? (
              <Text style={[styles.medicationNote, { color: colors.textMuted }]}>
                Masukkan nama, dosis, dan waktu hanya sesuai instruksi dokter atau resep.
              </Text>
            ) : null}
            <Button
              label="Simpan di perangkat"
              onPress={() => createMutation.mutate({ type, label, detail, time, scheduleDate: today })}
              loading={createMutation.isPending}
              fullWidth
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showAIModal} animationType="slide" transparent>
        <Pressable style={styles.overlay} onPress={() => setShowAIModal(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: colors.backgroundCard }]} onPress={() => {}}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>AI Generate jadwal</Text>
              <TouchableOpacity
                onPress={() => setShowAIModal(false)}
                style={[styles.closeBtn, { backgroundColor: colors.backgroundElement }]}
              >
                <Icon name="close" size="sm" color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.aiInfo, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <View style={[styles.aiAvatar, { backgroundColor: colors.primaryLight }]}>
                <Icon name="sparkles" size="md" color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[styles.aiInfoTitle, { color: colors.text }]}>
                  Heally membuat jadwal dari:
                </Text>
                {[
                  'Ringkasan rekam medis yang tersimpan lokal',
                  'Aktivitas makan, minum, dan olahraga',
                  'Jadwal obat manual sebagai batasan waktu',
                ].map((item, i) => (
                  <View key={i} style={styles.aiPoint}>
                    <Icon name="checkmark" size="sm" color={colors.primary} />
                    <Text style={[styles.aiPointText, { color: colors.textSecondary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={[styles.aiDisclaimer, { color: colors.textMuted }]}>
              AI tidak boleh membuat jadwal obat. Rekomendasi lain tetap perlu Anda periksa sebelum disimpan.
            </Text>

            <Button
              label="Generate sekarang"
              onPress={() => aiGenerateMutation.mutate()}
              loading={aiGenerateMutation.isPending}
              fullWidth
            />
            <Button
              label="Batal"
              variant="ghost"
              onPress={() => setShowAIModal(false)}
              fullWidth
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <Pressable style={styles.overlay} onPress={() => setShowCreateModal(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: colors.backgroundCard }]} onPress={() => {}}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Tambah jadwal</Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={[styles.closeBtn, { backgroundColor: colors.backgroundElement }]}
              >
                <Icon name="close" size="sm" color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.createTypeRow}>
              {TYPE_OPTIONS.map((opt) => (
                <Chip
                  key={opt.type}
                  label={opt.label}
                  icon={scheduleIcons[opt.type]}
                  active={newType === opt.type}
                  onPress={() => setNewType(opt.type)}
                />
              ))}
            </View>

            <TextField
              label="Nama kegiatan"
              value={newLabel}
              onChangeText={setNewLabel}
              placeholder="Minum obat tensi"
              style={styles.createField}
            />
            <TextField
              label="Detail (opsional)"
              value={newDetail}
              onChangeText={setNewDetail}
              placeholder="1 tablet setelah makan"
              style={styles.createField}
            />
            <TextField
              label="Waktu (HH:MM)"
              value={newTime}
              onChangeText={setNewTime}
              placeholder="08:00"
              keyboardType="numbers-and-punctuation"
              style={styles.createField}
            />

            <Button
              label="Simpan jadwal"
              onPress={handleCreateSubmit}
              loading={createMutation.isPending}
              fullWidth
              style={styles.createField}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: BorderRadius.full,
  },
  aiBtnText: { color: 'white', fontSize: FontSize.xs, fontFamily: Fonts.bold },
  createTypeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  createField: { marginTop: Spacing.base },
  progressBlock: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, gap: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  progressPct: { fontSize: FontSize.sm, fontFamily: Fonts.bold, minWidth: 36, textAlign: 'right' },
  progressLabel: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: Spacing.lg, gap: 12, paddingBottom: 100 },
  categories: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  categoryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.full,
  },
  categoryCount: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  itemsList: { gap: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    paddingBottom: 40,
    gap: Spacing.base,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: FontSize.lg, fontFamily: Fonts.bold },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  typeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: {
    borderWidth: 1, borderRadius: BorderRadius.md,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: FontSize.sm, fontFamily: Fonts.regular,
  },
  medicationNote: { fontSize: FontSize.xs, lineHeight: 18, fontFamily: Fonts.regular },
  aiInfo: {
    flexDirection: 'row', gap: 12, padding: Spacing.base,
    borderRadius: BorderRadius.md, alignItems: 'flex-start', borderWidth: 1,
  },
  aiAvatar: {
    width: 40, height: 40, borderRadius: BorderRadius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  aiInfoTitle: { fontSize: FontSize.sm, fontFamily: Fonts.medium, marginBottom: 2 },
  aiPoint: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  aiPointText: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  aiDisclaimer: { fontSize: FontSize.xs, textAlign: 'center', fontFamily: Fonts.regular },
});
