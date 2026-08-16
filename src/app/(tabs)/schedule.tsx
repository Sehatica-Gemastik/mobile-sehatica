import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, ActivityIndicator, Alert,
  useColorScheme, Pressable, TextInput,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { EmptyState, Icon, ScreenHeader } from '@/components/ui';
import { appointmentsService, PatientAppointment } from '@/services/appointments.service';
import { doctorService } from '@/services/doctor.service';
import { Doctor } from '@/types';

export default function ScheduleScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [title, setTitle] = useState('Konsultasi');
  const [notes, setNotes] = useState('');
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');

  const { data: appointments = [], isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: () => appointmentsService.list(),
    placeholderData: [],
    refetchInterval: 30000,
  });

  const { data: partners = [] } = useQuery({
    queryKey: ['doctor-partners'],
    queryFn: doctorService.getPartners,
    placeholderData: [],
  });

  const createMutation = useMutation({
    mutationFn: appointmentsService.create,
    onSuccess: () => {
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      Alert.alert('Berhasil', 'Appointment berhasil dibuat.');
    },
    onError: (err: any) => Alert.alert('Gagal', err.message ?? 'Tidak bisa membuat appointment'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof appointmentsService.update>[1] }) =>
      appointmentsService.update(id, payload),
    onSuccess: () => {
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      Alert.alert('Berhasil', 'Appointment berhasil diperbarui.');
    },
    onError: (err: any) => Alert.alert('Gagal', err.message ?? 'Tidak bisa memperbarui appointment'),
  });

  const deleteMutation = useMutation({
    mutationFn: appointmentsService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patient-appointments'] }),
    onError: (err: any) => Alert.alert('Gagal', err.message ?? 'Tidak bisa menghapus appointment'),
  });

  const saving = createMutation.isPending || updateMutation.isPending;

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatInput = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const parseInput = (value: string): Date | null => {
    const s = value.trim().replace('T', ' ');
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
    return Number.isFinite(d.getTime()) ? d : null;
  };

  const openCreate = () => {
    if (!partners.length) {
      Alert.alert('Belum ada partner', 'Hubungkan ke dokter partner dulu di tab Dokter.');
      return;
    }
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const end = new Date(now.getTime() + 3600_000);
    setEditingId(null);
    setSelectedDoctorId(String(partners[0].id));
    setTitle('Konsultasi');
    setNotes('');
    setStartInput(formatInput(now));
    setEndInput(formatInput(end));
    setModalOpen(true);
  };

  const openEdit = (item: PatientAppointment) => {
    setEditingId(item.id);
    setSelectedDoctorId(String(item.doctorId));
    setTitle(item.title);
    setNotes(item.notes ?? '');
    setStartInput(formatInput(new Date(item.start)));
    setEndInput(formatInput(new Date(item.end)));
    setModalOpen(true);
  };

  const handleDelete = (item: PatientAppointment) => {
    Alert.alert('Hapus appointment?', item.title, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(item.id),
      },
    ]);
  };

  const submit = () => {
    const doctorId = parseInt(selectedDoctorId, 10);
    const start = parseInput(startInput);
    const end = parseInput(endInput);
    if (!Number.isFinite(doctorId)) {
      Alert.alert('Pilih dokter terlebih dahulu');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Judul appointment wajib diisi');
      return;
    }
    if (!start || !end) {
      Alert.alert('Format waktu tidak valid', 'Gunakan: YYYY-MM-DD HH:mm');
      return;
    }
    if (end.getTime() <= start.getTime()) {
      Alert.alert('Waktu selesai harus setelah waktu mulai');
      return;
    }
    const payload = {
      doctorId,
      title: title.trim(),
      notes: notes.trim(),
      start: start.toISOString(),
      end: end.toISOString(),
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const upcoming = appointments
    .filter((a) => new Date(a.start).getTime() >= Date.now() - 3_600_000)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const past = appointments
    .filter((a) => new Date(a.start).getTime() < Date.now() - 3_600_000)
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
    .slice(0, 5);

  const renderAppointmentCard = (item: PatientAppointment) => {
    const startDate = new Date(item.start);
    const endDate = new Date(item.end);
    const isPast = startDate.getTime() < Date.now() - 3_600_000;
    const dateStr = startDate.toLocaleDateString('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
    const timeStr = `${startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

    return (
      <View
        key={item.id}
        style={[
          styles.card,
          { backgroundColor: colors.backgroundCard, borderColor: colors.borderLight },
          isPast && { opacity: 0.65 },
        ]}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.cardLeft}>
            <View style={[styles.dateBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.dateBadgeDay, { color: colors.primary }]}>
                {String(startDate.getDate()).padStart(2, '0')}
              </Text>
              <Text style={[styles.dateBadgeMon, { color: colors.primary }]}>
                {startDate.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
              {item.doctorName}{item.specialty ? ` · ${item.specialty}` : ''}
            </Text>
            <Text style={[styles.cardTime, { color: colors.textMuted }]}>
              {dateStr} · {timeStr}
            </Text>
            {item.notes ? (
              <Text style={[styles.cardNotes, { color: colors.textMuted }]} numberOfLines={2}>
                {item.notes}
              </Text>
            ) : null}
          </View>
        </View>
        {!isPast ? (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.primary }]}
              onPress={() => openEdit(item)}
              activeOpacity={0.8}
            >
              <Icon name="pencil-outline" size="sm" color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>Ubah</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: '#EF4444' }]}
              onPress={() => handleDelete(item)}
              activeOpacity={0.8}
            >
              <Icon name="trash-outline" size="sm" color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Hapus</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Jadwal appointment"
        subtitle="Appointment dengan dokter partner"
        right={
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={openCreate}
            activeOpacity={0.8}
            accessibilityLabel="Tambah appointment"
          >
            <Icon name="add" size="md" color={colors.onPrimary} />
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Tidak dapat memuat appointment"
          description={error instanceof Error ? error.message : 'Periksa koneksi dan coba lagi.'}
          actionLabel="Coba lagi"
          onAction={refetch}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
        >
          {upcoming.length === 0 && past.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="Belum ada appointment"
              description="Tambah appointment pertama Anda atau tunggu dokter membuat jadwal."
              actionLabel="Tambah appointment"
              onAction={openCreate}
            />
          ) : (
            <>
              {upcoming.length > 0 ? (
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.text }]}>Mendatang</Text>
                  {upcoming.map(renderAppointmentCard)}
                </View>
              ) : null}

              {past.length > 0 ? (
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Riwayat</Text>
                  {past.map(renderAppointmentCard)}
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      )}

      {/* Modal tambah / edit appointment */}
      <Modal visible={modalOpen} animationType="slide" transparent>
        <Pressable style={styles.overlay} onPress={() => setModalOpen(false)}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: colors.backgroundCard }]}
            onPress={() => null}
          >
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingId ? 'Ubah appointment' : 'Tambah appointment'}
            </Text>

            {/* Pilih dokter */}
            <View>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Dokter</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorRow}>
                {partners.map((doctor: Doctor) => {
                  const active = selectedDoctorId === String(doctor.id);
                  return (
                    <TouchableOpacity
                      key={doctor.id}
                      style={[
                        styles.doctorChip,
                        {
                          backgroundColor: active ? colors.primaryLight : colors.backgroundElement,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedDoctorId(String(doctor.id))}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={{
                          color: active ? colors.primary : colors.textSecondary,
                          fontFamily: Fonts.medium,
                          fontSize: FontSize.sm,
                        }}
                      >
                        {doctor.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Judul */}
            <View>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Judul</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="misal: Konsultasi rutin"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Catatan */}
            <View>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Catatan (opsional)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Topik atau pertanyaan yang ingin dibahas"
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Waktu mulai */}
            <View>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Waktu mulai</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="2026-08-20 09:00"
                placeholderTextColor={colors.textMuted}
                value={startInput}
                onChangeText={setStartInput}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            {/* Waktu selesai */}
            <View>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Waktu selesai</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="2026-08-20 10:00"
                placeholderTextColor={colors.textMuted}
                value={endInput}
                onChangeText={setEndInput}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Format waktu: YYYY-MM-DD HH:mm
            </Text>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
              onPress={submit}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Text style={[styles.submitBtnText, { color: colors.onPrimary }]}>
                {saving ? 'Menyimpan...' : editingId ? 'Simpan perubahan' : 'Buat appointment'}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  addBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  scrollContent: { padding: Spacing.lg, gap: 12, paddingBottom: 120 },
  section: { gap: 10 },
  sectionLabel: { fontSize: FontSize.sm, fontFamily: Fonts.bold, marginBottom: 2 },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.base,
    gap: 10,
  },
  cardTopRow: { flexDirection: 'row', gap: 12 },
  cardLeft: { alignItems: 'center' },
  dateBadge: {
    width: 44,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    paddingVertical: 6,
    gap: 1,
  },
  dateBadgeDay: { fontSize: FontSize.lg, fontFamily: Fonts.bold, lineHeight: 22 },
  dateBadgeMon: { fontSize: 10, fontFamily: Fonts.bold, lineHeight: 13 },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  cardMeta: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  cardTime: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  cardNotes: { fontSize: FontSize.xs, fontFamily: Fonts.regular, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionBtnText: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.38)', justifyContent: 'flex-end' },
  modalCard: {
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    paddingBottom: 40,
    gap: 10,
  },
  modalHandle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  modalTitle: { fontSize: FontSize.md, fontFamily: Fonts.bold },
  fieldLabel: { fontSize: FontSize.xs, fontFamily: Fonts.medium, marginBottom: 4 },
  doctorRow: { flexGrow: 0 },
  doctorChip: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FontSize.sm,
    fontFamily: Fonts.regular,
  },
  hint: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  submitBtn: {
    marginTop: 4,
    borderRadius: BorderRadius.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
});
