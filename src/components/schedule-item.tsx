import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, useColorScheme,
} from 'react-native';
import { ScheduleItem } from '@/types';
import { Colors, Fonts, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { Icon, scheduleIcons } from '@/components/ui';

interface ScheduleItemCardProps {
  item: ScheduleItem;
  onToggle: () => void;
  onLongPress?: () => void;
}

export function ScheduleItemCard({ item, onToggle, onLongPress }: ScheduleItemCardProps) {
  const cs = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[cs];
  const iconName = scheduleIcons[item.type] ?? scheduleIcons.other;

  return (
    <TouchableOpacity
      onPress={onToggle}
      onLongPress={onLongPress}
      accessibilityHint={onLongPress ? 'Tekan lama untuk menghapus aktivitas' : undefined}
      activeOpacity={0.82}
      style={[
        styles.container,
        Shadows.sm,
        {
          backgroundColor: colors.backgroundCard,
          opacity: item.done ? 0.6 : 1,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
        <Icon name={iconName} size="md" color={colors.primary} />
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.label,
            { color: item.done ? colors.textMuted : colors.text },
            item.done && styles.labelDone,
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
        {item.detail ? (
          <Text style={[styles.detail, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.detail}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <Text style={[styles.time, { color: colors.textMuted }]}>{item.time}</Text>
        <View
          style={[
            styles.checkbox,
            item.done
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { borderColor: colors.borderLight },
          ]}
        >
          {item.done ? <Icon name="checkmark" size="sm" color={colors.onPrimary} /> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: BorderRadius.xl,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1, gap: 2 },
  label: { fontSize: FontSize.sm, fontFamily: Fonts.semibold },
  labelDone: { textDecorationLine: 'line-through' },
  detail: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  right: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  time: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
