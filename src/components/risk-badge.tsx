import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { RiskLevel } from '@/types';
import { Colors, Fonts, FontSize, BorderRadius } from '@/constants/theme';
import { Icon } from '@/components/ui';

const LEVEL_CONFIG: Record<RiskLevel, { label: string; icon: 'checkmark-circle' | 'alert-circle' | 'warning' }> = {
  rendah: { label: 'Risiko rendah', icon: 'checkmark-circle' },
  sedang: { label: 'Risiko sedang', icon: 'alert-circle' },
  tinggi: { label: 'Risiko tinggi', icon: 'warning' },
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const cfg = LEVEL_CONFIG[level];

  const tone = level === 'tinggi' ? colors.red : level === 'sedang' ? colors.amber : colors.primary;
  const toneLight = level === 'tinggi' ? colors.redLight : level === 'sedang' ? colors.amberLight : colors.primaryLight;

  return (
    <View style={[styles.badge, { backgroundColor: toneLight }]}>
      <Icon name={cfg.icon} size="sm" color={tone} />
      <Text style={[styles.text, { color: tone }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: { fontSize: FontSize.xs, fontFamily: Fonts.bold },
});
