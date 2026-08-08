import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { IconSize, IconSizeToken, ThemeColors } from '@/constants/theme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  name: IconName;
  size?: IconSizeToken;
  color?: string;
};

/** consistent icons — size via tokens only (sm/md/lg) */
export function Icon({ name, size = 'md', color }: Props) {
  return <Ionicons name={name} size={IconSize[size]} color={color} />;
}

export const scheduleIcons: Record<string, IconName> = {
  food: 'restaurant-outline',
  pill: 'medical-outline',
  exercise: 'fitness-outline',
  water: 'water-outline',
  other: 'clipboard-outline',
};

export const recordIcons: Record<string, IconName> = {
  consultation: 'person-outline',
  image: 'camera-outline',
  voice: 'mic-outline',
  note: 'document-text-outline',
};

export function iconColor(colors: ThemeColors, tone: 'primary' | 'muted' | 'text' | 'onPrimary' = 'text') {
  if (tone === 'primary') return colors.primary;
  if (tone === 'muted') return colors.textMuted;
  if (tone === 'onPrimary') return colors.onPrimary;
  return colors.text;
}
