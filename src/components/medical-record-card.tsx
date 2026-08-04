import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, useColorScheme,
} from 'react-native';
import { MedicalRecord } from '@/types';
import { Colors, FontSize, BorderRadius, Spacing } from '@/constants/theme';

interface MedicalRecordCardProps {
  record: MedicalRecord;
  onPress?: () => void;
  compact?: boolean;
}

const typeConfig = {
  consultation: { icon: '👤', bg: '#EFF6FF', text: '#2563EB', label: 'Konsultasi' },
  image: { icon: '📷', bg: '#FAF5FF', text: '#9333EA', label: 'Lab/Foto' },
  voice: { icon: '🎤', bg: '#FEF2F2', text: '#DC2626', label: 'Rekaman' },
  note: { icon: '📝', bg: '#F9FAFB', text: '#6B7280', label: 'Catatan' },
};

export function MedicalRecordCard({ record, onPress, compact = false }: MedicalRecordCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const config = typeConfig[record.type] ?? typeConfig.note;

  const formattedDate = record.recordDate
    ?? new Date(record.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[styles.compactContainer, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
      >
        <View style={[styles.compactIcon, { backgroundColor: config.bg }]}>
          <Text style={{ fontSize: 16 }}>{config.icon}</Text>
        </View>
        <View style={styles.compactContent}>
          <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={1}>
            {record.title}
          </Text>
          <Text style={[styles.compactDate, { color: colors.textMuted }]}>{formattedDate}</Text>
        </View>
        <Text style={{ color: colors.border, fontSize: 18 }}>›</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.container, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
          <Text style={{ fontSize: 20 }}>{config.icon}</Text>
        </View>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2} style={{ flex: 1 }}>
              {record.title}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
              <Text style={[styles.typeLabel, { color: config.text }]}>{config.label}</Text>
            </View>
          </View>
          <Text style={[styles.date, { color: colors.textMuted }]}>{formattedDate}</Text>
        </View>
      </View>

      {record.summary && (
        <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={3}>
          {record.summary}
        </Text>
      )}

      {record.tags && record.tags.length > 0 && (
        <View style={styles.tags}>
          {record.tags.slice(0, 4).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {record.isAiSummarized && (
        <View style={styles.aiRow}>
          <Text style={{ fontSize: 10 }}>🤖</Text>
          <Text style={[styles.aiLabel, { color: colors.textMuted }]}>Diringkas AI</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerContent: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    lineHeight: 18,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    flexShrink: 0,
  },
  typeLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  date: {
    fontSize: FontSize.xs,
  },
  summary: {
    fontSize: FontSize.xs,
    lineHeight: 17,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiLabel: {
    fontSize: FontSize.xs,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  compactContent: {
    flex: 1,
    gap: 2,
  },
  compactTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  compactDate: {
    fontSize: 10,
  },
});
