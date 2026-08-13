import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, useColorScheme, Platform,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { recordsService, NotMedicalDocumentError } from '@/services/records.service';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { MedicalRecordCard } from '@/components/medical-record-card';
import {
  DocumentProcessingOverlay,
  type DocumentProcessingPhase,
  type DocumentProcessingState,
} from '@/components/document-processing-overlay';
import { EmptyState, Icon, Chip, ScreenHeader } from '@/components/ui';
import { resolveDocumentMime, isSupportedMedicalFileMime } from '@/utils/document-mime';
import { medicalStorageBlockedReason } from '@/utils/runtime-environment';
import { showUserMessage } from '@/utils/user-message';
import { readDocumentFile } from '@/utils/read-document-file';
import { delay, waitForUi } from '@/utils/wait-for-ui';

type SortOrder = 'newest' | 'oldest';
const PAGE_SIZE = 10;

const SORT_OPTIONS: { id: SortOrder; label: string }[] = [
  { id: 'newest', label: 'Terbaru' },
  { id: 'oldest', label: 'Terlama' },
];

export default function RecordsScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const queryClient = useQueryClient();

  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [page, setPage] = useState(1);
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

  const storageBlocked = medicalStorageBlockedReason();
  const isProcessing = processing !== null;

  const ensureUploadAllowed = (): boolean => {
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

  const processPdfFile = async (uri: string, name?: string) => {
    const mimeType = resolveDocumentMime(name, 'application/pdf');
    if (!isSupportedMedicalFileMime(mimeType)) {
      showUserMessage('Format tidak didukung', 'Unggah file PDF saja.');
      return;
    }

    setProcessing({ phase: 'saving', kind: 'pdf', fileName: name ?? 'Dokumen PDF' });
    await waitForUi(120);

    let recordId: number | null = null;
    try {
      setPhase('reading');
      const { bytes, base64 } = await readDocumentFile(uri);

      setPhase('saving');
      const record = await recordsService.createDocument({
        fileData: bytes,
        title: name,
        cacheUri: uri,
      });
      recordId = record.id;
      await queryClient.invalidateQueries({ queryKey: ['records'] });

      setPhase('parsing');
      try {
        await recordsService.enrichDocument(record.id, base64);
        setPhase('finishing');
        await queryClient.invalidateQueries({ queryKey: ['records'] });
        await delay(500);
        setProcessing(null);
        showUserMessage('Berhasil', 'PDF rekam medis tersimpan di perangkat dan berhasil diparse.');
      } catch (err) {
        setProcessing(null);
        if (err instanceof NotMedicalDocumentError) {
          await recordsService.delete(record.id);
          await queryClient.invalidateQueries({ queryKey: ['records'] });
          showUserMessage('Bukan dokumen medis', err.message);
        } else {
          const detail = err instanceof Error ? err.message : 'Parsing gagal';
          showUserMessage('PDF tersimpan', `File ada di SQLite, parsing gagal: ${detail}`);
        }
      }
    } catch (err) {
      setProcessing(null);
      if (recordId) await recordsService.delete(recordId).catch(() => null);
      showUserMessage('Gagal', err instanceof Error ? err.message : 'PDF tidak dapat disimpan.');
    }
  };

  const handlePickPdf = async () => {
    if (!ensureUploadAllowed() || isProcessing) return;

    setProcessing({ phase: 'saving', kind: 'pdf', fileName: 'Membuka pemilih file…' });
    await waitForUi(120);
    await delay(Platform.OS === 'android' ? 450 : 220);

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
      await processPdfFile(asset.uri, asset.name);
    } catch (err) {
      setProcessing(null);
      showUserMessage('Gagal', err instanceof Error ? err.message : 'Pemilih PDF gagal');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Rekam medis"
        subtitle={`${allRecords.length} dokumen PDF tersimpan`}
        right={
          <TouchableOpacity
            onPress={handlePickPdf}
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
              icon="document-text-outline"
              title="Belum ada dokumen PDF"
              description="Tap + untuk upload PDF rekam medis. File disimpan aman di SQLite perangkat."
              actionLabel="Upload PDF"
              onAction={handlePickPdf}
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
                  Menampilkan {sortedRecords.length} dokumen
                </Text>
              ) : null}
            </>
          )}
        </ScrollView>
      )}

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
