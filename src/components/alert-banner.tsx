import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { CriticalAlert } from '@/types';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { Icon } from '@/components/ui';

interface Props {
  alerts: CriticalAlert[];
  onAcknowledge: (id: number) => void;
  acknowledgingId?: number | null;
}

const PARAM_LABEL: Record<string, string> = {
  tensi: 'Tensi tinggi',
  gula_darah: 'Gula darah tinggi',
  kepatuhan_jadwal: 'Kepatuhan jadwal menurun',
};

export function AlertBanner({ alerts, onAcknowledge, acknowledgingId }: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  if (alerts.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {alerts.map((alert) => (
        <View
          key={alert.id}
          style={[styles.card, { backgroundColor: colors.redLight, borderColor: '#FECACA' }]}
        >
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(220,38,38,0.12)' }]}>
            <Icon name="warning" size="md" color={colors.red} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.title, { color: colors.red }]}>
              {PARAM_LABEL[alert.jenisParameter] ?? alert.jenisParameter}
            </Text>
            <Text style={[styles.desc, { color: '#991B1B' }]}>{alert.thresholdTerlampaui}</Text>
            {alert.statusEskalasiDokter ? (
              <Text style={[styles.escalate, { color: colors.red }]}>Sudah masuk antrean verifikasi dokter</Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => onAcknowledge(alert.id)}
            disabled={acknowledgingId === alert.id}
            hitSlop={8}
            style={styles.dismissBtn}
          >
            <Icon name="close" size="sm" color={colors.red} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: Spacing.base, borderRadius: BorderRadius.md, borderWidth: 1,
  },
  iconWrap: { width: 32, height: 32, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  desc: { fontSize: FontSize.xs, fontFamily: Fonts.regular, lineHeight: 16 },
  escalate: { fontSize: 10, fontFamily: Fonts.bold, marginTop: 2 },
  dismissBtn: { padding: 2 },
});
