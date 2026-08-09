import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { VerifStatus } from '@/types';
import { Colors, Fonts, FontSize, BorderRadius } from '@/constants/theme';
import { Icon } from '@/components/ui';

interface VerifBadgeProps {
  status: VerifStatus;
  doctorName?: string | null;
  note?: string | null;
}

export function VerifBadge({ status, doctorName, note }: VerifBadgeProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  if (status === 'approved') {
    return (
      <View style={[styles.badge, { backgroundColor: colors.primaryLight, borderColor: colors.primaryMuted }]}>
        <Icon name="checkmark-circle" size="sm" color={colors.primary} />
        <Text style={[styles.badgeText, { color: colors.primary }]}>
          Diverifikasi {doctorName}
        </Text>
      </View>
    );
  }

  if (status === 'revised') {
    return (
      <View style={[styles.reviseContainer, { backgroundColor: colors.blueLight, borderColor: '#BFDBFE' }]}>
        <View style={styles.badge}>
          <Icon name="create-outline" size="sm" color={colors.blue} />
          <Text style={[styles.badgeText, { color: colors.blue }]}>
            Direvisi oleh {doctorName}
          </Text>
        </View>
        {note ? <Text style={[styles.reviseNote, { color: colors.blue }]}>{note}</Text> : null}
      </View>
    );
  }

  if (status === 'pending') {
    return (
      <View style={[styles.badge, { backgroundColor: colors.amberLight, borderColor: '#FDE68A' }]}>
        <Icon name="time-outline" size="sm" color={colors.amber} />
        <Text style={[styles.badgeText, { color: colors.amber }]}>
          Menunggu verifikasi dokter…
        </Text>
      </View>
    );
  }

  return null;
}

interface RequestVerifButtonProps {
  onPress: () => void;
  loading?: boolean;
}

export function RequestVerifButton({ onPress, loading }: RequestVerifButtonProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={[
        styles.requestBtn,
        { borderColor: colors.primary, backgroundColor: colors.backgroundCard },
        loading && styles.requestBtnDisabled,
      ]}
      activeOpacity={0.7}
    >
      <Icon name="medkit-outline" size="sm" color={colors.primary} />
      <Text style={[styles.requestBtnText, { color: colors.primary }]}>
        {loading ? 'Mengirim...' : 'Minta Verifikasi Dokter'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: 6,
  },
  badgeText: { fontSize: FontSize.xs, fontFamily: Fonts.medium, flexShrink: 1 },
  reviseContainer: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 10,
    marginTop: 6,
    gap: 4,
  },
  reviseNote: { fontSize: FontSize.xs, lineHeight: 18, fontFamily: Fonts.regular },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  requestBtnDisabled: { opacity: 0.5 },
  requestBtnText: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
});
