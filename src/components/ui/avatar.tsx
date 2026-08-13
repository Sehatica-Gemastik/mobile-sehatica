import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors, Fonts, FontSize, BorderRadius } from '@/constants/theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<AvatarSize, number> = {
  sm: 40,
  md: 48,
  lg: 56,
  xl: 96,
};

const FONT_MAP: Record<AvatarSize, number> = {
  sm: FontSize.xs,
  md: FontSize.sm,
  lg: FontSize.md,
  xl: FontSize.xl,
};

export function deriveInitials(name: string | null | undefined, fallback = '??'): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

type InitialsAvatarProps = {
  initials?: string | null;
  name?: string | null;
  size?: AvatarSize;
  showOnline?: boolean;
  isOnline?: boolean;
  style?: ViewStyle;
};

export function InitialsAvatar({
  initials,
  name,
  size = 'md',
  showOnline,
  isOnline,
  style,
}: InitialsAvatarProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const dimension = SIZE_MAP[size];
  const label = (initials?.trim() || deriveInitials(name)).slice(0, 2).toUpperCase();

  return (
    <View
      style={[
        styles.base,
        {
          width: dimension,
          height: dimension,
          borderRadius: size === 'xl' ? BorderRadius.full : BorderRadius.sm,
          backgroundColor: colors.primaryLight,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.primary, fontSize: FONT_MAP[size] }]}>
        {label}
      </Text>
      {showOnline ? (
        <View
          style={[
            styles.dot,
            { backgroundColor: isOnline ? '#4ADE80' : '#A1A1AA' },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  text: {
    fontFamily: Fonts.bold,
  },
  dot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
});
