import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Alert, Image, useColorScheme,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { File, Paths } from 'expo-file-system';
import { useQuery, useMutation } from '@tanstack/react-query';
import { recordsService } from '@/services/records.service';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { Button, Icon, surfaceHeaderShell } from '@/components/ui';
import { AppScreen } from '@/components/screen-background';
import { useScreenTopPadding } from '@/hooks/use-screen-top-padding';
import { documentKindLabel, parseStandardMedicalRecord } from '@/utils/parse-medical-record';

function SectionBlock({ title, children, colors }: { title: string; children: React.ReactNode; colors: typeof Colors.light }) {
  return (
    <View style={[styles.section, Shadows.sm, { backgroundColor: colors.backgroundCard }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recordId = Number(id);
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const topPadding = useScreenTopPadding();

  const { data: record, isLoading, error } = useQuery({
    queryKey: ['record', recordId],
    queryFn: () => recordsService.getById(recordId),
    enabled: Number.isFinite(recordId) && recordId > 0,
  });

  const { data: fileBlob } = useQuery({
    queryKey: ['record-file', recordId],
    queryFn: () => recordsService.getFile(recordId),
    enabled: !!record && record.type === 'image',
  });

  const previewUri = useMemo(() => {
    if (!fileBlob || fileBlob.mime.includes('pdf')) return null;
    const ext = fileBlob.mime.includes('png') ? 'png' : 'jpg';
    const target = new File(Paths.cache, `record-preview-${recordId}.${ext}`);
    target.write(fileBlob.data);
    return target.uri;
  }, [fileBlob, recordId]);

  const isPdfFile = fileBlob?.mime.includes('pdf') ?? false;

  const exportMutation = useMutation({
    mutationFn: () => recordsService.exportRecord(recordId),
    onError: (err: Error) => Alert.alert('Gagal', err.message),
  });

  const exportImageMutation = useMutation({
    mutationFn: () => recordsService.exportOriginalImage(recordId),
    onError: (err: Error) => Alert.alert('Gagal', err.message),
  });

  if (isLoading) {
    return (
      <AppScreen style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </AppScreen>
    );
  }

  if (error || !record) {
    return (
      <AppScreen style={styles.center}>
        <Text style={{ color: colors.textSecondary }}>Rekam medis tidak ditemukan</Text>
        <Button label="Kembali" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </AppScreen>
    );
  }

  const standard = parseStandardMedicalRecord(record.content);

  return (
    <AppScreen style={styles.container}>
      <View style={[styles.header, surfaceHeaderShell(colors), { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.backgroundElement }]}>
          <Icon name="chevron-back" size="sm" color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{record.title}</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>Detail rekam medis</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {standard ? (
          <View style={[styles.badgeRow, { backgroundColor: colors.primaryLight }]}>
            <Icon name="sparkles-outline" size="sm" color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primaryDark }]}>
              Vision AI · {documentKindLabel(standard.documentKind)}
            </Text>
          </View>
        ) : null}

        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
        ) : null}

        {isPdfFile ? (
          <View style={[styles.pdfCard, Shadows.sm, { backgroundColor: colors.backgroundCard }]}>
            <Icon name="document-text-outline" size="lg" color={colors.primary} />
            <Text style={[styles.pdfTitle, { color: colors.text }]}>Dokumen PDF tersimpan</Text>
            <Text style={[styles.pdfHint, { color: colors.textMuted }]}>
              Pratinjau PDF di app belum tersedia. Gunakan unduh untuk membuka file asli.
            </Text>
          </View>
        ) : null}

        <SectionBlock title="Ringkasan" colors={colors}>
          <Text style={[styles.body, { color: colors.textSecondary }]}>{record.summary ?? '—'}</Text>
          {record.doctorName ? (
            <Text style={[styles.meta, { color: colors.textMuted }]}>Dokter: {record.doctorName}</Text>
          ) : null}
          {record.recordDate ? (
            <Text style={[styles.meta, { color: colors.textMuted }]}>Tanggal dokumen: {record.recordDate}</Text>
          ) : null}
        </SectionBlock>

        {standard?.sections.diagnosis?.length ? (
          <SectionBlock title="Diagnosis" colors={colors}>
            {standard.sections.diagnosis.map((item) => (
              <Text key={item} style={[styles.bullet, { color: colors.textSecondary }]}>• {item}</Text>
            ))}
          </SectionBlock>
        ) : null}

        {standard?.sections.medications?.length ? (
          <SectionBlock title="Obat" colors={colors}>
            {standard.sections.medications.map((med) => (
              <Text key={`${med.name}-${med.dose}`} style={[styles.bullet, { color: colors.textSecondary }]}>
                • {med.name}{med.dose ? ` — ${med.dose}` : ''}{med.frequency ? ` (${med.frequency})` : ''}
              </Text>
            ))}
          </SectionBlock>
        ) : null}

        {standard?.sections.labResults?.length ? (
          <SectionBlock title="Hasil Lab" colors={colors}>
            {standard.sections.labResults.map((lab) => (
              <Text key={lab.test} style={[styles.bullet, { color: colors.textSecondary }]}>
                • {lab.test}: {lab.value ?? '—'} {lab.unit ?? ''}{lab.reference ? ` (ref: ${lab.reference})` : ''}
              </Text>
            ))}
          </SectionBlock>
        ) : null}

        {standard?.sections.instructions?.length ? (
          <SectionBlock title="Instruksi" colors={colors}>
            {standard.sections.instructions.map((item) => (
              <Text key={item} style={[styles.bullet, { color: colors.textSecondary }]}>• {item}</Text>
            ))}
          </SectionBlock>
        ) : null}

        {standard?.sections.rawExtractedText ? (
          <SectionBlock title="Teks ekstraksi" colors={colors}>
            <Text style={[styles.body, { color: colors.textSecondary }]}>{standard.sections.rawExtractedText}</Text>
          </SectionBlock>
        ) : !standard && record.content ? (
          <SectionBlock title="Isi catatan" colors={colors}>
            <Text style={[styles.body, { color: colors.textSecondary }]}>{record.content}</Text>
          </SectionBlock>
        ) : null}

        <View style={styles.actions}>
          <Button
            label="Unduh ringkasan"
            variant="secondary"
            onPress={() => exportMutation.mutate()}
            loading={exportMutation.isPending}
            loadingLabel="Menyiapkan..."
            fullWidth
          />
          {fileBlob ? (
            <Button
              label="Unduh foto asli"
              variant="secondary"
              onPress={() => exportImageMutation.mutate()}
              loading={exportImageMutation.isPending}
              loadingLabel="Menyiapkan..."
              fullWidth
            />
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: Spacing.lg,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  headerTitle: { fontSize: FontSize.md, fontFamily: Fonts.bold },
  headerSub: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  content: { padding: Spacing.lg, gap: Spacing.base, paddingBottom: Spacing.xxxl },
  badgeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.full, alignSelf: 'flex-start',
  },
  badgeText: { fontSize: FontSize.xs, fontFamily: Fonts.bold },
  previewImage: {
    width: '100%', height: 220, borderRadius: BorderRadius.md, backgroundColor: '#111',
  },
  pdfCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 8,
  },
  pdfTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  pdfHint: { fontSize: FontSize.xs, textAlign: 'center', fontFamily: Fonts.regular },
  section: { borderRadius: BorderRadius.xl, padding: Spacing.base, gap: 8 },
  sectionTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  body: { fontSize: FontSize.sm, lineHeight: 21, fontFamily: Fonts.regular },
  meta: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  bullet: { fontSize: FontSize.sm, lineHeight: 20, fontFamily: Fonts.regular },
  actions: { gap: 10, marginTop: Spacing.sm },
});
