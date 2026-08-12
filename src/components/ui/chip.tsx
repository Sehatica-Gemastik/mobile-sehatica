import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme, ViewStyle } from 'react-native';
import { Colors, Fonts, FontSize, BorderRadius } from '@/constants/theme';
import { Icon, IconName } from './icon';

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: IconName;
  style?: ViewStyle;
};

export function Chip({ label, active, onPress, icon, style }: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primaryLight : colors.backgroundElement,
        },
        style,
      ]}
    >
      {icon ? (
        <Icon name={icon} size="sm" color={active ? colors.primary : colors.textSecondary} />
      ) : null}
      <Text style={[styles.label, { color: active ? colors.primary : colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
  },
  label: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
});
