import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, ActivityIndicator, Alert,
  useColorScheme, Pressable, TextInput,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '@/services/schedule.service';
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
];

export default function ScheduleScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [type, setType] = useState<ScheduleType>('food');
  const [label, setLabel] = useState('');
  const [detail, setDetail] = useState('');
  const [time, setTime] = useState('07:00');

  const today = localDateKey();
  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const { data: items = [], error, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['schedules', today],
    queryFn: () => scheduleService.getForDate(today),
  });

  const toggleMutation = useMutation({
    mutationFn: scheduleService.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: scheduleService.create,
    onSuccess: () => {
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
        right={<View style={styles.headerActions}>
          <TouchableOpacity
            accessibilityLabel="Tambah aktivitas"
            onPress={() => setShowAddModal(true)}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Icon name="add" size="md" color={colors.onPrimary} />
          </TouchableOpacity>
        </View>}
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
              description="Tambahkan aktivitas harianmu"
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
                  onLongPress={() => confirmDelete(item)}
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
});
