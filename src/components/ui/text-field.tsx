import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  TextInputProps, Platform, useColorScheme,
} from 'react-native';
import {
  Colors, Fonts, FontSize, BorderRadius, nativeReset,
} from '@/constants/theme';
import { Icon, IconName } from './icon';

type Props = TextInputProps & {
  label?: string;
  icon?: IconName;
  secureToggle?: boolean;
  showSecure?: boolean;
  onToggleSecure?: () => void;
};

export function TextField({
  label, icon, secureToggle, showSecure, onToggleSecure, style, ...rest
}: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <View style={styles.group}>
      {label ? (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      ) : null}
      <View style={[styles.wrap, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        {icon ? <Icon name={icon} size="sm" color={colors.textMuted} /> : null}
        <TextInput
          {...rest}
          style={[styles.input, { color: colors.text }, style]}
          placeholderTextColor={colors.textMuted}
          underlineColorAndroid="transparent"
          selectionColor={colors.primary}
          autoCorrect={rest.autoCorrect ?? false}
        />
        {secureToggle ? (
          <TouchableOpacity onPress={onToggleSecure} hitSlop={8} activeOpacity={0.7}>
            <Icon
              name={showSecure ? 'eye-off-outline' : 'eye-outline'}
              size="sm"
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  label: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
  },
  input: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: Fonts.regular,
    minHeight: 22,
    padding: 0,
    ...(Platform.OS === 'web' ? nativeReset : null),
  },
});
