import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { VerifStatus } from '@/types';
import { Colors, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from 'react-native';

interface VerifBadgeProps {
  status: VerifStatus;
  doctorName?: string | null;
  note?: string | null;
  onRequestVerif?: () => void;
}

export function VerifBadge({ status, doctorName, note, onRequestVerif }: VerifBadgeProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  if (status === 'approved') {
    return (
      <View style={[styles.badge, { backgroundColor: colors.primaryLight, borderColor: '#86efac' }]}>
        <Text style={styles.badgeIcon}>✅</Text>
        <Text style={[styles.badgeText, { color: colors.primary }]}>
          Diverifikasi {doctorName}
        </Text>
      </View>
    );
  }

  if (status === 'revised') {
    return (
      <View style={[styles.reviseContainer, { backgroundColor: colors.blueLight, borderColor: '#bfdbfe' }]}>
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>🔵</Text>
          <Text style={[styles.badgeText, { color: colors.blue }]}>
            Direvisi oleh {doctorName}
          </Text>
        </View>
        {note && (
          <Text style={[styles.reviseNote, { color: colors.blue }]}>{note}</Text>
        )}
      </View>
    );
  }

  if (status === 'pending') {
    return (
      <View style={[styles.badge, { backgroundColor: colors.amberLight, borderColor: '#fde68a' }]}>
        <View style={styles.pendingDot} />
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
  const scheme = useColorScheme() ?? 'light';
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
      <Text style={styles.requestBtnIcon}>🩺</Text>
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
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: 6,
  },
  badgeIcon: {
    fontSize: FontSize.sm,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    flexShrink: 1,
  },
  reviseContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 10,
    marginTop: 6,
    gap: 4,
  },
  reviseNote: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  requestBtnDisabled: {
    opacity: 0.5,
  },
  requestBtnIcon: {
    fontSize: FontSize.sm,
  },
  requestBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
