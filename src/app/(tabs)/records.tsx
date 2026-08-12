import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, TextInput, ActivityIndicator,
  Alert, useColorScheme, Pressable, Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { recordsService, NotMedicalDocumentError } from '@/services/records.service';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, nativeReset } from '@/constants/theme';
import { MedicalRecordCard } from '@/components/medical-record-card';
import {
  DocumentProcessingOverlay,
  type DocumentProcessingKind,
  type DocumentProcessingPhase,
  type DocumentProcessingState,
} from '@/components/document-processing-overlay';
import { Button, Chip, EmptyState, Icon, IconName, ScreenHeader } from '@/components/ui';
import { resolveDocumentMime, isSupportedMedicalFileMime } from '@/utils/document-mime';
import { medicalStorageBlockedReason } from '@/utils/runtime-environment';
import { showUserMessage } from '@/utils/user-message';
import { bytesFromBase64, readDocumentFile } from '@/utils/read-document-file';
import { delay, waitForUi } from '@/utils/wait-for-ui';

type SortOrder = 'newest' | 'oldest';
const PAGE_SIZE = 10;

const SORT_OPTIONS: { id: SortOrder; label: string }[] = [
  { id: 'newest', label: 'Terbaru' },
  { id: 'oldest', label: 'Terlama' },
];

type AddType = 'text' | 'image' | 'voice';

const ADD_TYPES: { type: AddType; icon: IconName; label: string }[] = [
  { type: 'text', icon: 'document-text-outline', label: 'Teks' },
  { type: 'image', icon: 'camera-outline', label: 'Dokumen' },
  { type: 'voice', icon: 'mic-outline', label: 'Suara' },
];

export default function RecordsScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const queryClient = useQueryClient();

  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<AddType>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [voiceNote, setVoiceNote] = useState('');
  const [processing, setProcessing] = useState<DocumentProcessingState | null>(null);

  const setPhase = (phase: DocumentProcessingPhase) => {
    setProcessing((prev) => (prev ? { ...prev, phase } : prev));
  };

  const { data: allRecords = [], error, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['records'],
    queryFn: () => recordsService.getAll(),
  });

  const sortedRecords = useMemo(() => {
    const copy = [...allRecords];
    copy.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
    });
    return copy;
  }, [allRecords, sortOrder]);

  const visibleRecords = sortedRecords.slice(0, page * PAGE_SIZE);
  const hasMore = visibleRecords.length < sortedRecords.length;
  const records = visibleRecords;

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

  const storageBlocked = medicalStorageBlockedReason();

  const ensureDocumentUploadAllowed = (): boolean => {
    if (storageBlocked) {
      showUserMessage('Upload tidak tersedia', storageBlocked);
      return false;
    }
    if (!useAuthStore.getState().user?.id) {
      showUserMessage('Login diperlukan', 'Silakan login dulu sebelum upload rekam medis.');
      return false;
    }
    return true;
  };

  const openPickerWithOverlay = async (kind: DocumentProcessingKind) => {
    setProcessing({ phase: 'saving', kind, fileName: 'Membuka pemilih file…' });
    setShowAdd(false);
    await waitForUi(120);
    await delay(Platform.OS === 'android' ? 450 : 220);
  };

  const processDocumentFile = async (params: {
    uri: string;
    mimeType: string;
    name?: string;
    base64?: string;
  }) => {
    const mimeType = resolveDocumentMime(params.name, params.mimeType);
    if (!isSupportedMedicalFileMime(mimeType)) {
      showUserMessage('Format tidak didukung', 'Unggah PDF atau foto (JPG/PNG).');
      return;
    }

    const kind: DocumentProcessingKind = mimeType.includes('pdf') ? 'pdf' : 'photo';
    setProcessing({ phase: 'saving', kind, fileName: params.name ?? (kind === 'pdf' ? 'Dokumen PDF' : 'Foto dokumen') });
    await waitForUi(120);

    let recordId: number | null = null;
    try {
      setPhase('reading');
      const { bytes, base64 } = params.base64
        ? { bytes: bytesFromBase64(params.base64), base64: params.base64 }
        : await readDocumentFile(params.uri);

      setPhase('saving');
      const record = await recordsService.createImage({
        fileData: bytes,
        title: params.name,
        mimeType,
        cacheUri: params.uri,
      });
      recordId = record.id;
      await queryClient.invalidateQueries({ queryKey: ['records'] });

      setPhase('parsing');
      try {
        await recordsService.enrichImage(record.id, base64, mimeType);
        setPhase('finishing');
        await queryClient.invalidateQueries({ queryKey: ['records'] });
        await delay(500);
        setProcessing(null);
        showUserMessage('Berhasil', 'Dokumen medis berhasil diparse dan distandarkan.');
      } catch (err) {
        setProcessing(null);
        if (err instanceof NotMedicalDocumentError) {
          await recordsService.delete(record.id);
          await queryClient.invalidateQueries({ queryKey: ['records'] });
          showUserMessage('Bukan dokumen medis', err.message);
        } else {
          const detail = err instanceof Error ? err.message : 'Parsing gagal';
          showUserMessage('Dokumen tersimpan', `File ada di perangkat, tapi parsing gagal: ${detail}`);
        }
      }
    } catch (err) {
      setProcessing(null);
      if (recordId) await recordsService.delete(recordId).catch(() => null);
      showUserMessage('Gagal', err instanceof Error ? err.message : 'Dokumen tidak dapat disimpan.');
    }
  };

  const handlePickPdf = async () => {
    if (!ensureDocumentUploadAllowed()) return;
    await openPickerWithOverlay('pdf');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets[0]) {
        setProcessing(null);
        return;
      }
      const asset = result.assets[0];
      await processDocumentFile({
        uri: asset.uri,
        mimeType: resolveDocumentMime(asset.name, asset.mimeType ?? 'application/pdf'),
        name: asset.name,
      });
    } catch (err) {
      setProcessing(null);
      showUserMessage('Gagal', err instanceof Error ? err.message : 'Pemilih PDF gagal');
    }
  };

  const handlePickImageFile = async () => {
    if (!ensureDocumentUploadAllowed()) return;
    await openPickerWithOverlay('photo');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets[0]) {
        setProcessing(null);
        return;
      }
      const asset = result.assets[0];
      const mimeType = resolveDocumentMime(asset.name, asset.mimeType);
      if (!mimeType.startsWith('image/')) {
        setProcessing(null);
        showUserMessage('Format tidak didukung', 'Pilih file foto (JPG/PNG).');
        return;
      }
      await processDocumentFile({
        uri: asset.uri,
        mimeType,
        name: asset.name,
      });
    } catch (err) {
      setProcessing(null);
      showUserMessage('Gagal', err instanceof Error ? err.message : 'Pemilih foto gagal');
    }
  };

  const handlePickCamera = async () => {
    if (!ensureDocumentUploadAllowed()) return;
    setShowAdd(false);
    await waitForUi(80);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showUserMessage('Izin Ditolak', 'Akses kamera diperlukan');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.75, base64: true });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    await processDocumentFile({
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      name: asset.fileName ?? undefined,
      base64: asset.base64 ?? undefined,
    });
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

  const isProcessing = processing !== null;
  const isLoaderShowing = createMutation.isPending || voiceMutation.isPending || isProcessing;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Rekam medis"
        subtitle={`${allRecords.length} catatan tersimpan`}
        right={
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            disabled={isProcessing}
            style={[styles.addBtn, { backgroundColor: colors.primary, opacity: isProcessing ? 0.6 : 1 }]}
            activeOpacity={0.8}
          >
            <Icon name="add" size="md" color={colors.onPrimary} />
          </TouchableOpacity>
        }
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <View style={styles.filters}>
            {SORT_OPTIONS.map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                active={sortOrder === option.id}
                onPress={() => {
                  setSortOrder(option.id);
                  setPage(1);
                }}
              />
            ))}
          </View>
        </ScrollView>
      </ScreenHeader>

      {storageBlocked ? (
        <View style={[styles.storageBanner, { backgroundColor: colors.amberLight, borderColor: colors.amber }]}>
          <Icon name="warning-outline" size="sm" color={colors.amber} />
          <Text style={[styles.storageBannerText, { color: colors.textSecondary }]}>{storageBlocked}</Text>
        </View>
      ) : null}

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
            <>
              {records.map((rec) => (
                <MedicalRecordCard
                  key={rec.id}
                  record={rec}
                  onPress={() => router.push(`/record/${rec.id}`)}
                />
              ))}
              {hasMore ? (
                <TouchableOpacity
                  onPress={() => setPage((p) => p + 1)}
                  style={[styles.loadMore, { backgroundColor: colors.backgroundElement }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                    Muat lebih banyak ({visibleRecords.length}/{sortedRecords.length})
                  </Text>
                </TouchableOpacity>
              ) : sortedRecords.length > PAGE_SIZE ? (
                <Text style={[styles.pageInfo, { color: colors.textMuted }]}>
                  Menampilkan {sortedRecords.length} catatan
                </Text>
              ) : null}
            </>
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
              <View style={styles.formGroup}>
                <TouchableOpacity
                  onPress={handlePickPdf}
                  disabled={isProcessing}
                  style={[styles.uploadZone, { borderColor: colors.border, backgroundColor: colors.backgroundElement, opacity: isProcessing ? 0.6 : 1 }]}
                  activeOpacity={0.7}
                >
                  <View style={styles.uploadContent}>
                    <Icon name="document-text-outline" size="lg" color={colors.textMuted} />
                    <Text style={[styles.uploadText, { color: colors.text }]}>Upload PDF rekam medis</Text>
                    <Text style={[styles.uploadHint, { color: colors.textMuted }]}>
                      Ekstrak teks PDF → parse standar via LLM
                    </Text>
                  </View>
                </TouchableOpacity>
                <Button
                  label="Pilih foto (galeri/file)"
                  variant="secondary"
                  onPress={handlePickImageFile}
                  disabled={isProcessing}
                  fullWidth
                />
                <Button
                  label="Ambil foto kamera"
                  variant="secondary"
                  onPress={handlePickCamera}
                  disabled={isProcessing}
                  fullWidth
                />
              </View>
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

      <DocumentProcessingOverlay state={processing} />
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
  loadMore: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    marginTop: 4,
  },
  loadMoreText: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.bold,
  },
  pageInfo: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    fontFamily: Fonts.regular,
    marginTop: 8,
  },
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
  storageBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  storageBannerText: { flex: 1, fontSize: FontSize.xs, lineHeight: 18, fontFamily: Fonts.regular },
});
