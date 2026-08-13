import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, useColorScheme,
} from 'react-native';
import { MedicalRecord } from '@/types';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { Icon, recordIcons } from '@/components/ui';

interface MedicalRecordCardProps {
  record: MedicalRecord;
  onPress?: () => void;
  compact?: boolean;
}

const typeMeta = {
  consultation: { bg: '#E0F7FA', text: '#008A93', label: 'Konsultasi' },
  image: { bg: '#F4F7F8', text: '#64748B', label: 'Lab/Foto' },
  voice: { bg: '#FEF2F2', text: '#DC2626', label: 'Rekaman' },
  note: { bg: '#F4F7F8', text: '#64748B', label: 'Catatan' },
};

export function MedicalRecordCard({ record, onPress, compact = false }: MedicalRecordCardProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const meta = typeMeta[record.type] ?? typeMeta.note;
  const iconName = record.fileMime?.includes('pdf') ? 'document-text-outline' : (recordIcons[record.type] ?? recordIcons.note);
  const label = record.fileMime?.includes('pdf') ? 'PDF' : meta.label;
  const badgeBg = record.fileMime?.includes('pdf') ? '#E0F7FA' : meta.bg;
  const badgeText = record.fileMime?.includes('pdf') ? '#008A93' : meta.text;

  const formattedDate = record.recordDate
    ?? new Date(record.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.82}
        style={[styles.compactContainer, Shadows.sm, { backgroundColor: colors.backgroundCard }]}
      >
        <View style={[styles.compactIcon, { backgroundColor: badgeBg }]}>
          <Icon name={iconName} size="sm" color={badgeText} />
        </View>
        <View style={styles.compactContent}>
          <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={1}>
            {record.title}
          </Text>
          <Text style={[styles.compactDate, { color: colors.textMuted }]}>{formattedDate}</Text>
        </View>
        <Icon name="chevron-forward" size="sm" color={colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[styles.container, Shadows.sm, { backgroundColor: colors.backgroundCard }]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: badgeBg }]}>
          <Icon name={iconName} size="md" color={badgeText} />
        </View>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {record.title}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.typeLabel, { color: badgeText }]}>{label}</Text>
            </View>
          </View>
          <Text style={[styles.date, { color: colors.textMuted }]}>{formattedDate}</Text>
        </View>
      </View>

      {record.summary ? (
        <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={3}>
          {record.summary}
        </Text>
      ) : null}

      {record.tags && record.tags.length > 0 ? (
        <View style={styles.tags}>
          {record.tags.slice(0, 4).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {record.isAiSummarized ? (
        <View style={styles.aiRow}>
          <Icon name="sparkles-outline" size="sm" color={colors.textMuted} />
          <Text style={[styles.aiLabel, { color: colors.textMuted }]}>Diringkas AI</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    gap: 10,
  },
  header: { flexDirection: 'row', gap: 12 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerContent: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  title: { fontSize: FontSize.sm, fontFamily: Fonts.semibold, lineHeight: 18, flex: 1 },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    flexShrink: 0,
  },
  typeLabel: { fontSize: FontSize.xs, fontFamily: Fonts.semibold },
  date: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  summary: { fontSize: FontSize.xs, lineHeight: 17, fontFamily: Fonts.regular },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  tagText: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  aiRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiLabel: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  compactContent: { flex: 1, gap: 2 },
  compactTitle: { fontSize: FontSize.xs, fontFamily: Fonts.semibold },
  compactDate: { fontSize: 11, fontFamily: Fonts.regular },
});
