import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { HeallyCtaAction } from '@/utils/heally-cta';
import { Colors, Fonts, FontSize, BorderRadius } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui';

type Props = {
  actions: HeallyCtaAction[];
  onAction: (action: HeallyCtaAction) => void;
  loadingType?: HeallyCtaAction['type'] | null;
};

const ICONS: Record<HeallyCtaAction['type'], IconName> = {
  generate_schedule: 'calendar-outline',
  open_screening: 'clipboard-outline',
  open_daily_log: 'create-outline',
};

export function HeallyChatActions({ actions, onAction, loadingType }: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  if (actions.length === 0) return null;

  return (
    <View style={styles.row}>
      {actions.map((action) => {
        const loading = loadingType === action.type;
        return (
          <TouchableOpacity
            key={action.type}
            onPress={() => onAction(action)}
            disabled={Boolean(loadingType)}
            style={[
              styles.btn,
              { backgroundColor: colors.primaryLight, borderColor: colors.primaryMuted },
            ]}
            activeOpacity={0.75}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon name={ICONS[action.type]} size="sm" color={colors.primary} />
            )}
            <Text style={[styles.label, { color: colors.primary }]} numberOfLines={2}>
              {action.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    maxWidth: '100%',
  },
  label: { fontSize: FontSize.xs, fontFamily: Fonts.medium, flexShrink: 1 },
});
