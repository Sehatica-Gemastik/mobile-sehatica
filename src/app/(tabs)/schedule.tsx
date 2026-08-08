import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, ActivityIndicator, Alert,
  useColorScheme, Pressable,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '@/services/schedule.service';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { ScheduleItemCard } from '@/components/schedule-item';
import { Button, EmptyState, Icon, ScreenHeader, scheduleIcons } from '@/components/ui';
import { ScheduleItem } from '@/types';

export default function ScheduleScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const queryClient = useQueryClient();
  const [showAIModal, setShowAIModal] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const { data: items = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['schedules', today],
    queryFn: () => scheduleService.getForDate(today),
  });

  const toggleMutation = useMutation({
    mutationFn: scheduleService.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const aiGenerateMutation = useMutation({
    mutationFn: scheduleService.aiGenerate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowAIModal(false);
    },
    onError: (err: any) => Alert.alert('Gagal', err.message),
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Jadwal harian"
        subtitle={todayLabel}
        right={
          <TouchableOpacity
            onPress={() => setShowAIModal(true)}
            style={[styles.aiBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Icon name="sparkles" size="sm" color={colors.onPrimary} />
            <Text style={styles.aiBtnText}>AI Generate</Text>
          </TouchableOpacity>
        }
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

          {items.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="Belum ada jadwal hari ini"
              description="Generate jadwal otomatis berdasarkan rekam medis Anda"
              actionLabel="Generate jadwal AI"
              onAction={() => setShowAIModal(true)}
            />
          ) : (
            <View style={styles.itemsList}>
              {items.map((item: ScheduleItem) => (
                <ScheduleItemCard
                  key={item.id}
                  item={item}
                  onToggle={() => toggleMutation.mutate(item.id)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}

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
                  'Rekam medis & diagnosis',
                  'Obat yang dikonsumsi',
                  'Kondisi kesehatan',
                  'Pola makan & aktivitas ideal',
                ].map((item, i) => (
                  <View key={i} style={styles.aiPoint}>
                    <Icon name="checkmark" size="sm" color={colors.primary} />
                    <Text style={[styles.aiPointText, { color: colors.textSecondary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={[styles.aiDisclaimer, { color: colors.textMuted }]}>
              Jadwal AI bersifat rekomendasi dan belum diverifikasi dokter
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: BorderRadius.full,
  },
  aiBtnText: { color: 'white', fontSize: FontSize.xs, fontFamily: Fonts.bold },
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
