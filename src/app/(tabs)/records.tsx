import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, TextInput, ActivityIndicator,
  Alert, useColorScheme, Pressable, Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { recordsService } from '@/services/records.service';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, nativeReset } from '@/constants/theme';
import { MedicalRecordCard } from '@/components/medical-record-card';
import { Button, Chip, EmptyState, Icon, IconName, ScreenHeader } from '@/components/ui';
import { RecordType } from '@/types';

const FILTERS: { id: 'all' | RecordType; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'consultation', label: 'Konsultasi' },
  { id: 'image', label: 'Lab/Foto' },
  { id: 'voice', label: 'Rekaman' },
  { id: 'note', label: 'Catatan' },
];

type AddType = 'text' | 'image' | 'voice';

const ADD_TYPES: { type: AddType; icon: IconName; label: string }[] = [
  { type: 'text', icon: 'document-text-outline', label: 'Teks' },
  { type: 'image', icon: 'camera-outline', label: 'Foto/OCR' },
  { type: 'voice', icon: 'mic-outline', label: 'Suara' },
];

export default function RecordsScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<'all' | RecordType>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<AddType>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [voiceNote, setVoiceNote] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  const { data: records = [], error, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['records', activeFilter],
    queryFn: () => recordsService.getAll(activeFilter === 'all' ? undefined : activeFilter),
  });

  const createMutation = useMutation({
    mutationFn: recordsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      resetAdd();
    },
    onError: (err: any) => Alert.alert('Gagal', err.message),
  });

  const voiceMutation = useMutation({
    mutationFn: (data: { title: string; transcription?: string }) =>
      recordsService.createVoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
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
    if (!result.canceled) {
      setIsOcrLoading(true);
      try {
        const asset = result.assets[0];
        const record = await recordsService.createImage({
          fileUri: asset.uri,
          title: asset.fileName ?? undefined,
          mimeType: asset.mimeType ?? 'image/jpeg',
        });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['records'] }),
        ]);
        resetAdd();

        if (!asset.base64) {
          Alert.alert('Foto tersimpan', 'OCR belum dijalankan karena data gambar tidak tersedia.');
          return;
        }

        try {
          await recordsService.enrichImage(
            record.id,
            asset.base64,
            asset.mimeType ?? 'image/jpeg'
          );
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['records'] }),
          ]);
        } catch {
          Alert.alert('Foto tersimpan', 'OCR sedang tidak tersedia. Rekam medis tetap tersimpan di perangkat.');
        }
      } catch {
        Alert.alert('Gagal', 'Foto tidak dapat disimpan di perangkat.');
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
      <ScreenHeader
        title="Rekam medis"
        subtitle={`${records.length} catatan tersimpan`}
        right={
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Icon name="add" size="md" color={colors.onPrimary} />
          </TouchableOpacity>
        }
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <View style={styles.filters}>
            {FILTERS.map((f) => (
              <Chip
                key={f.id}
                label={f.label}
                active={activeFilter === f.id}
                onPress={() => setActiveFilter(f.id)}
              />
            ))}
          </View>
        </ScrollView>
      </ScreenHeader>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
        >
          {error ? (
            <EmptyState
              icon="alert-circle-outline"
              title="Penyimpanan lokal tidak tersedia"
              description={error instanceof Error ? error.message : 'Coba buka kembali aplikasi.'}
            />
          ) : records.length === 0 ? (
            <EmptyState
              icon="clipboard-outline"
              title="Belum ada rekam medis"
              description="Tap tombol + untuk menambahkan rekam medis Anda"
            />
          ) : (
            records.map((rec) => <MedicalRecordCard key={rec.id} record={rec} />)
          )}
        </ScrollView>
      )}

      <Modal visible={showAdd} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={resetAdd}>
          <Pressable style={[styles.modalCard, { backgroundColor: colors.backgroundCard }]} onPress={() => {}}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Tambah rekam medis</Text>
              <TouchableOpacity
                onPress={resetAdd}
                style={[styles.closeBtn, { backgroundColor: colors.backgroundElement }]}
              >
                <Icon name="close" size="sm" color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.typeGrid}>
              {ADD_TYPES.map(({ type, icon, label }) => {
                const isActive = addType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setAddType(type)}
                    style={[
                      styles.typeCard,
                      {
                        borderColor: isActive ? colors.primary : 'transparent',
                        backgroundColor: isActive ? colors.primaryLight : colors.backgroundElement,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Icon name={icon} size="md" color={isActive ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.typeLabel, { color: isActive ? colors.primary : colors.textSecondary }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {addType === 'text' && (
              <View style={styles.formGroup}>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundElement }]}
                  placeholder="Judul catatan"
                  placeholderTextColor={colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                  underlineColorAndroid="transparent"
                  selectionColor={colors.primary}
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
                  underlineColorAndroid="transparent"
                  selectionColor={colors.primary}
                />
              </View>
            )}

            {addType === 'image' && (
              <TouchableOpacity
                onPress={handlePickImage}
                disabled={isOcrLoading}
                style={[styles.uploadZone, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}
                activeOpacity={0.7}
              >
                {isOcrLoading ? (
                  <View style={styles.uploadContent}>
                    <ActivityIndicator color={colors.primary} />
                    <Text style={[styles.uploadText, { color: colors.primary }]}>Memproses OCR...</Text>
                  </View>
                ) : (
                  <View style={styles.uploadContent}>
                    <Icon name="cloud-upload-outline" size="lg" color={colors.textMuted} />
                    <Text style={[styles.uploadText, { color: colors.text }]}>Pilih foto dokumen medis</Text>
                    <Text style={[styles.uploadHint, { color: colors.textMuted }]}>
                      AI akan membaca dan meringkas dokumen Anda
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {addType === 'voice' && (
              <View style={styles.formGroup}>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundElement }]}
                  placeholder="Judul catatan suara"
                  placeholderTextColor={colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                  underlineColorAndroid="transparent"
                  selectionColor={colors.primary}
                />
                <TextInput
                  style={[styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.backgroundElement }]}
                  placeholder="Ketik transkripsi atau catatan suara..."
                  placeholderTextColor={colors.textMuted}
                  value={voiceNote}
                  onChangeText={setVoiceNote}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  underlineColorAndroid="transparent"
                  selectionColor={colors.primary}
                />
              </View>
            )}

            {addType !== 'image' && (
              <Button label="Simpan" onPress={handleSave} loading={isLoaderShowing} fullWidth />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  filtersScroll: { paddingTop: Spacing.sm },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.lg, gap: 12, paddingBottom: 100 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
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
  typeGrid: { flexDirection: 'row', gap: 10 },
  typeCard: {
    flex: 1, alignItems: 'center', gap: 8, padding: 12,
    borderRadius: BorderRadius.md, borderWidth: 1.5,
  },
  typeLabel: { fontSize: FontSize.xs, fontFamily: Fonts.medium, textAlign: 'center' },
  formGroup: { gap: 10 },
  textInput: {
    borderWidth: 1, borderRadius: BorderRadius.md,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: FontSize.sm, fontFamily: Fonts.regular,
    ...(Platform.OS === 'web' ? nativeReset : null),
  },
  textArea: {
    borderWidth: 1, borderRadius: BorderRadius.md,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: FontSize.sm, fontFamily: Fonts.regular, minHeight: 100,
    ...(Platform.OS === 'web' ? nativeReset : null),
  },
  uploadZone: { borderWidth: 1, borderStyle: 'dashed', borderRadius: BorderRadius.lg, padding: Spacing.xl },
  uploadContent: { alignItems: 'center', gap: 8 },
  uploadText: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
  uploadHint: { fontSize: FontSize.xs, textAlign: 'center', fontFamily: Fonts.regular },
});
