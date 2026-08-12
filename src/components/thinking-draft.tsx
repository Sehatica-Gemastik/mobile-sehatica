import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors, Fonts, FontSize, BorderRadius } from '@/constants/theme';
import { Icon } from '@/components/ui';

const DEFAULT_STEPS = [
  'Memeriksa rekam medis & kondisi…',
  'Membaca screening PTM & catatan hari ini…',
  'Menilai jadwal obat hari ini…',
  'Menyusun jawaban personal…',
];

interface ThinkingDraftProps {
  steps?: string[];
}

/** Compact in-flight indicator — not a chat bubble. */
export function ThinkingDraft({ steps = DEFAULT_STEPS }: ThinkingDraftProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % steps.length), 2200);
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Icon name="sparkles" size="sm" color={colors.onPrimary} />
      </View>
      <View style={styles.body}>
        <View style={[styles.strip, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <Icon name="hourglass-outline" size="sm" color={colors.primary} />
          <Text style={[styles.label, { color: colors.textMuted }]}>Heally berpikir</Text>
        </View>
        <Text style={[styles.step, { color: colors.textSecondary }]} numberOfLines={1}>
          {steps[idx]}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    paddingLeft: 0,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  body: {
    flex: 1,
    maxWidth: '82%',
    gap: 4,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
  },
  step: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.regular,
    paddingHorizontal: 4,
    fontStyle: 'italic',
  },
});
