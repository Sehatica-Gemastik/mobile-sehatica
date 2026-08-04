import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, TextInput, ActivityIndicator,
  Alert, useColorScheme, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { recordsService } from '@/services/records.service';
import { Colors, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { MedicalRecordCard } from '@/components/medical-record-card';
import { RecordType } from '@/types';

const FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'consultation', label: 'Konsultasi' },
  { id: 'image', label: 'Lab/Foto' },
  { id: 'voice', label: 'Rekaman' },
  { id: 'note', label: 'Catatan' },
];

type AddType = 'text' | 'image' | 'voice';

export default function RecordsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<AddType>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [voiceNote, setVoiceNote] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  const { data: records = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['records', activeFilter],
    queryFn: () => recordsService.getAll(activeFilter === 'all' ? undefined : activeFilter),
  });

  const createMutation = useMutation({
    mutationFn: recordsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      resetAdd();
    },
    onError: (err: any) => Alert.alert('Gagal', err.message),
  });

  const ocrMutation = useMutation({
    mutationFn: ({ base64, mime }: { base64: string; mime: string }) =>
      recordsService.ocrImage(base64, mime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      resetAdd();
    },
    onError: (err: any) => Alert.alert('OCR Gagal', err.message),
  });

  const voiceMutation = useMutation({
    mutationFn: (data: { title: string; transcription?: string }) =>
      recordsService.createVoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      resetAdd();
    },
    onError: (err: any) => Alert.alert('Gagal', err.message),
  });

  const resetAdd = () => {
    setShowAdd(false);
    setTitle('');
    setContent('');
    setVoiceNote('');
    setAddType('text');
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin Ditolak', 'Akses galeri diperlukan untuk upload foto');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setIsOcrLoading(true);
      try {
        const asset = result.assets[0];
        await ocrMutation.mutateAsync({
          base64: asset.base64!,
          mime: asset.mimeType ?? 'image/jpeg',
        });
      } finally {
        setIsOcrLoading(false);
      }
    }
  };

  const handleSave = () => {
    if (addType === 'text') {
      if (!title.trim()) {
        Alert.alert('Perhatian', 'Judul wajib diisi');
        return;
      }
      createMutation.mutate({ type: 'note', title: title.trim(), content: content.trim() });
    } else if (addType === 'voice') {
      if (!title.trim()) {
        Alert.alert('Perhatian', 'Judul wajib diisi');
        return;
      }
      voiceMutation.mutate({ title: title.trim(), transcription: voiceNote.trim() || undefined });
    }
  };

  const isLoaderShowing = createMutation.isPending || voiceMutation.isPending || isOcrLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.backgroundCard, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Rekam Medis</Text>
            <Text style={[styles.headerSub, { color: colors.textMuted }]}>
              {records.length} catatan tersimpan
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <View style={styles.filters}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => setActiveFilter(f.id)}
                style={[
                  styles.filterChip,
                  activeFilter === f.id
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.backgroundElement },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterText,
                  { color: activeFilter === f.id ? 'white' : colors.textSecondary },
                ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Records list */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
        >
          {records.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40 }}>📋</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum ada rekam medis</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                Tap tombol + untuk menambahkan rekam medis Anda
              </Text>
            </View>
          ) : (
            records.map((rec) => (
              <MedicalRecordCard key={rec.id} record={rec} />
            ))
          )}
        </ScrollView>
      )}

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={resetAdd}>
          <Pressable style={[styles.modalCard, { backgroundColor: colors.backgroundCard }]} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Tambah Rekam Medis</Text>
              <TouchableOpacity onPress={resetAdd} style={[styles.closeBtn, { backgroundColor: colors.backgroundElement }]}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Type selector */}
            <View style={styles.typeGrid}>
              {[
                { type: 'text', icon: '📝', label: 'Teks/Catatan' },
                { type: 'image', icon: '📷', label: 'Foto/OCR' },
                { type: 'voice', icon: '🎤', label: 'Rekam Suara' },
              ].map(({ type, icon, label }) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setAddType(type as AddType)}
                  style={[
                    styles.typeCard,
                    {
                      borderColor: addType === type ? colors.primary : colors.border,
                      backgroundColor: addType === type ? colors.primaryLight : colors.backgroundElement,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 24 }}>{icon}</Text>
                  <Text style={[styles.typeLabel, { color: addType === type ? colors.primary : colors.textSecondary }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Text form */}
            {addType === 'text' && (
              <View style={styles.formGroup}>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundElement }]}
                  placeholder="Judul catatan"
                  placeholderTextColor={colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />
                <TextInput
                  style={[styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundElement }]}
                  placeholder="Tuliskan catatan medis Anda..."
                  placeholderTextColor={colors.textMuted}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            )}

            {/* Image OCR */}
            {addType === 'image' && (
              <TouchableOpacity
                onPress={handlePickImage}
                disabled={isOcrLoading}
                style={[styles.uploadZone, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}
                activeOpacity={0.7}
              >
                {isOcrLoading ? (
                  <View style={styles.uploadContent}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.uploadText, { color: colors.primary }]}>Memproses OCR...</Text>
                  </View>
                ) : (
                  <View style={styles.uploadContent}>
                    <Text style={{ fontSize: 40 }}>📤</Text>
                    <Text style={[styles.uploadText, { color: colors.text }]}>Pilih foto dokumen medis</Text>
                    <Text style={[styles.uploadHint, { color: colors.textMuted }]}>
                      AI akan otomatis membaca dan meringkas dokumen Anda
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Voice */}
            {addType === 'voice' && (
              <View style={styles.formGroup}>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundElement }]}
                  placeholder="Judul catatan suara"
                  placeholderTextColor={colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />
                <TextInput
                  style={[styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundElement }]}
                  placeholder="Ketik transkripsi atau catatan suara Anda..."
                  placeholderTextColor={colors.textMuted}
                  value={voiceNote}
                  onChangeText={setVoiceNote}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            )}

            {addType !== 'image' && (
              <TouchableOpacity
                onPress={handleSave}
                disabled={isLoaderShowing}
                style={[styles.saveBtn, { backgroundColor: colors.primary }, isLoaderShowing && { opacity: 0.7 }]}
                activeOpacity={0.8}
              >
                {isLoaderShowing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveBtnText}>Simpan</Text>
                )}
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.base, paddingBottom: Spacing.sm,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800' },
  headerSub: { fontSize: FontSize.xs, marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: 'white', fontSize: 22, fontWeight: '700' },
  filtersScroll: { paddingBottom: 12 },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.full },
  filterText: { fontSize: FontSize.xs, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.lg, gap: 12, paddingBottom: 100 },
  emptyState: { alignItems: 'center', gap: 12, paddingTop: 60 },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '700' },
  emptyDesc: { fontSize: FontSize.sm, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl, padding: Spacing.xl, paddingBottom: 40, gap: Spacing.base },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 4 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  typeGrid: { flexDirection: 'row', gap: 10 },
  typeCard: { flex: 1, alignItems: 'center', gap: 8, padding: 12, borderRadius: BorderRadius.xl, borderWidth: 2 },
  typeLabel: { fontSize: FontSize.xs, fontWeight: '600', textAlign: 'center' },
  formGroup: { gap: 10 },
  textInput: { borderWidth: 1.5, borderRadius: BorderRadius.lg, paddingHorizontal: 14, paddingVertical: 12, fontSize: FontSize.sm },
  textArea: { borderWidth: 1.5, borderRadius: BorderRadius.lg, paddingHorizontal: 14, paddingVertical: 12, fontSize: FontSize.sm, minHeight: 100 },
  uploadZone: { borderWidth: 2, borderStyle: 'dashed', borderRadius: BorderRadius.xl, padding: Spacing.xl },
  uploadContent: { alignItems: 'center', gap: 8 },
  uploadText: { fontSize: FontSize.sm, fontWeight: '600' },
  uploadHint: { fontSize: FontSize.xs, textAlign: 'center' },
  saveBtn: { paddingVertical: 14, borderRadius: BorderRadius.lg, alignItems: 'center' },
  saveBtnText: { color: 'white', fontSize: FontSize.md, fontWeight: '700' },
});
