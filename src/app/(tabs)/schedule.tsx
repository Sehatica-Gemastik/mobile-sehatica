import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, ActivityIndicator, Alert,
  useColorScheme, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '@/services/schedule.service';
import { Colors, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { ScheduleItemCard } from '@/components/schedule-item';
import { ScheduleItem } from '@/types';

export default function ScheduleScreen() {
  const scheme = useColorScheme() ?? 'light';
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
      {/* Header */}
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.backgroundCard, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Jadwal Harian</Text>
            <Text style={[styles.headerDate, { color: colors.textMuted }]}>{todayLabel}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAIModal(true)}
            style={[styles.aiBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.aiBtnText}>🤖 AI Generate</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={[styles.progressBarBg, { backgroundColor: colors.backgroundElement }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${pct}%` as any }]} />
          </View>
          <Text style={[styles.progressPct, { color: colors.primary }]}>{pct}%</Text>
        </View>
        <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
          {done} dari {total} aktivitas selesai
        </Text>
      </SafeAreaView>

      {/* Body */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
          {/* Category summary */}
          {total > 0 && (
            <View style={styles.categories}>
              {[
                { type: 'food', icon: '🍽️', count: categoryCounts.food },
                { type: 'pill', icon: '💊', count: categoryCounts.pill },
                { type: 'exercise', icon: '🏃', count: categoryCounts.exercise },
                { type: 'water', icon: '💧', count: categoryCounts.water },
              ].filter((c) => c.count > 0).map((cat) => (
                <View key={cat.type} style={[styles.categoryPill, { backgroundColor: colors.backgroundElement }]}>
                  <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
                  <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>{cat.count}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Schedule items */}
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48 }}>📅</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum ada jadwal hari ini</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                Tap tombol AI Generate untuk membuat jadwal otomatis berdasarkan rekam medis Anda
              </Text>
              <TouchableOpacity
                onPress={() => setShowAIModal(true)}
                style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyBtnText}>🤖 Generate Jadwal AI</Text>
              </TouchableOpacity>
            </View>
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

      {/* AI Generate Modal */}
      <Modal visible={showAIModal} animationType="slide" transparent>
        <Pressable style={styles.overlay} onPress={() => setShowAIModal(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: colors.backgroundCard }]} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>AI Generate Jadwal</Text>
              <TouchableOpacity onPress={() => setShowAIModal(false)} style={[styles.closeBtn, { backgroundColor: colors.backgroundElement }]}>
                <Text style={{ fontSize: 16, color: colors.textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.aiInfo, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <Text style={{ fontSize: 28 }}>🤖</Text>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[styles.aiInfoTitle, { color: colors.text }]}>Heally akan membuat jadwal berdasarkan:</Text>
                {[
                  'Rekam medis & diagnosis Anda',
                  'Obat yang sedang dikonsumsi',
                  'Kondisi kesehatan Anda',
                  'Pola makan dan aktivitas ideal',
                ].map((item, i) => (
                  <View key={i} style={styles.aiPoint}>
                    <Text style={{ color: colors.accent, fontSize: 12 }}>✓</Text>
                    <Text style={[styles.aiPointText, { color: colors.textSecondary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={[styles.aiDisclaimer, { color: colors.textMuted }]}>
              *Jadwal AI bersifat rekomendasi dan belum diverifikasi dokter
            </Text>

            <TouchableOpacity
              onPress={() => aiGenerateMutation.mutate()}
              disabled={aiGenerateMutation.isPending}
              style={[styles.generateBtn, { backgroundColor: colors.primary }, aiGenerateMutation.isPending && { opacity: 0.7 }]}
              activeOpacity={0.8}
            >
              {aiGenerateMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.generateBtnText}>Generate Jadwal Sekarang</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAIModal(false)} style={styles.cancelBtn}>
              <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Batal</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: Spacing.sm, marginBottom: 12 },
  headerTitle: { fontSize: FontSize.xxl, fontFamily: 'PlayfairDisplay_600SemiBold' },
  headerDate: { fontSize: FontSize.xs, marginTop: 2, fontFamily: 'Inter_400Regular' },
  aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingVertical: 10, borderRadius: BorderRadius.full },
  aiBtnText: { color: 'white', fontSize: FontSize.xs, fontFamily: 'Inter_700Bold' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  progressBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  progressPct: { fontSize: FontSize.sm, fontFamily: 'Inter_700Bold', minWidth: 36, textAlign: 'right' },
  progressLabel: { fontSize: FontSize.xs, fontFamily: 'Inter_400Regular' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: Spacing.lg, gap: 12, paddingBottom: 100 },
  categories: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.full },
  categoryCount: { fontSize: FontSize.xs, fontFamily: 'Inter_600SemiBold' },
  itemsList: { gap: 8 },
  emptyState: { alignItems: 'center', gap: 12, paddingTop: 60 },
  emptyTitle: { fontSize: FontSize.md, fontFamily: 'Inter_700Bold' },
  emptyDesc: { fontSize: FontSize.sm, textAlign: 'center', paddingHorizontal: Spacing.xl, fontFamily: 'Inter_400Regular' },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: BorderRadius.full },
  emptyBtnText: { color: 'white', fontFamily: 'Inter_700Bold' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: BorderRadius.xxxl, borderTopRightRadius: BorderRadius.xxxl, padding: Spacing.xl, paddingBottom: 40, gap: Spacing.base },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 4 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: FontSize.lg, fontFamily: 'PlayfairDisplay_600SemiBold' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  aiInfo: { flexDirection: 'row', gap: 12, padding: Spacing.base, borderRadius: BorderRadius.xl, alignItems: 'flex-start', borderWidth: 1 },
  aiInfoTitle: { fontSize: FontSize.sm, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  aiPoint: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  aiPointText: { fontSize: FontSize.xs, fontFamily: 'Inter_400Regular' },
  aiDisclaimer: { fontSize: FontSize.xs, textAlign: 'center', fontFamily: 'Inter_400Regular' },
  generateBtn: { paddingVertical: 14, borderRadius: BorderRadius.full, alignItems: 'center', shadowColor: '#171717', shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  generateBtnText: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: FontSize.sm },
  cancelBtn: { paddingVertical: 10, alignItems: 'center' },
  cancelBtnText: { fontSize: FontSize.sm, fontFamily: 'Inter_500Medium' },
});
