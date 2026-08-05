import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, useColorScheme,
} from 'react-native';
import { ScheduleItem } from '@/types';
import { Colors, FontSize, BorderRadius, Spacing } from '@/constants/theme';

interface ScheduleItemCardProps {
  item: ScheduleItem;
  onToggle: () => void;
}

const typeIcon: Record<string, string> = {
  food: '🍽️',
  pill: '💊',
  exercise: '🏃',
  water: '💧',
  other: '📋',
};

const colorSchemes: Record<string, { bg: string; text: string; border: string }> = {
  'bg-orange-100 text-orange-600': { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
  'bg-blue-100 text-blue-600': { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  'bg-green-100 text-green-600': { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  'bg-cyan-100 text-cyan-600': { bg: '#ECFEFF', text: '#0891B2', border: '#A5F3FC' },
  'bg-yellow-100 text-yellow-600': { bg: '#FEFCE8', text: '#CA8A04', border: '#FDE047' },
  'bg-red-100 text-red-600': { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
};

function getColorScheme(scheme: string | null) {
  if (scheme && colorSchemes[scheme]) return colorSchemes[scheme];
  return colorSchemes['bg-blue-100 text-blue-600'];
}

export function ScheduleItemCard({ item, onToggle }: ScheduleItemCardProps) {
  const cs = useColorScheme() ?? 'light';
  const colors = Colors[cs];
  const itemColors = getColorScheme(item.colorScheme);

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: item.done ? colors.backgroundElement : colors.backgroundCard,
          borderColor: item.done ? colors.border : colors.borderLight,
          opacity: item.done ? 0.6 : 1,
        },
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: itemColors.bg, borderColor: itemColors.border },
        ]}
      >
        <Text style={styles.icon}>{typeIcon[item.type] ?? '📋'}</Text>
      </View>

      {/* Content */}
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
        {item.detail && (
          <Text style={[styles.detail, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.detail}
          </Text>
        )}
      </View>

      {/* Right — time + checkbox */}
      <View style={styles.right}>
        <Text style={[styles.time, { color: colors.textMuted }]}>{item.time}</Text>
        <View
          style={[
            styles.checkbox,
            item.done
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { borderColor: colors.border },
          ]}
        >
          {item.done && <Text style={styles.checkmark}>✓</Text>}
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
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter_700Bold',
  },
  labelDone: {
    textDecorationLine: 'line-through',
  },
  detail: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter_400Regular',
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  time: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter_500Medium',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
});
