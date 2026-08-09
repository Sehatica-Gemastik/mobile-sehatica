import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Colors, Fonts, FontSize, BorderRadius } from '@/constants/theme';
import { Icon } from '@/components/ui';

interface ThinkingBlockProps {
  summary?: string | null;
  detail?: string | null;
}

/** Collapsed reasoning trace below assistant bubble — tap to expand. */
export function ThinkingBlock({ summary, detail }: ThinkingBlockProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const [open, setOpen] = useState(false);

  if (!summary && !detail) return null;

  const preview = summary ?? detail?.split('\n')[0] ?? 'Proses berpikir';

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.75}
        style={[styles.header, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}
      >
        <Icon name="bulb-outline" size="sm" color={colors.textMuted} />
        <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={open ? undefined : 1}>
          {open ? 'Proses berpikir Heally' : preview}
        </Text>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size="sm" color={colors.textMuted} />
      </TouchableOpacity>

      {open && detail ? (
        <View style={[styles.detail, { borderColor: colors.border, backgroundColor: colors.background }]}>
          {detail.split('\n').filter(Boolean).map((line, i) => (
            <Text key={i} style={[styles.detailLine, { color: colors.textMuted }]}>
              · {line}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 2,
    marginBottom: 4,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  preview: {
    flex: 1,
    fontSize: FontSize.xs,
    fontFamily: Fonts.regular,
  },
  detail: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  detailLine: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    fontFamily: Fonts.regular,
  },
});
