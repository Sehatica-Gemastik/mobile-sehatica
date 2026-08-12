import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, ScrollView, useColorScheme,
} from 'react-native';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { Button, Chip, Icon, TextField } from '@/components/ui';
import { RiskProfile, SmokingHabit } from '@/types';
import { RiskProfileInput } from '@/services/risk.service';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: RiskProfileInput) => void;
  submitting?: boolean;
  initial?: RiskProfile | null;
}

const SMOKING_OPTIONS: Array<{ value: SmokingHabit; label: string }> = [
  { value: 'tidak', label: 'Tidak merokok' },
  { value: 'kadang', label: 'Kadang' },
  { value: 'rutin', label: 'Rutin' },
];

const FAMILY_HISTORY_OPTIONS: Array<{ key: 'hipertensi' | 'diabetes' | 'jantung' | 'stroke'; label: string }> = [
  { key: 'hipertensi', label: 'Hipertensi' },
  { key: 'diabetes', label: 'Diabetes' },
  { key: 'jantung', label: 'Jantung' },
  { key: 'stroke', label: 'Stroke' },
];

export function HealthProfileModal({ visible, onClose, onSubmit, submitting, initial }: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  const [tensiSistolik, setTensiSistolik] = useState(initial?.tensiSistolik?.toString() ?? '');
  const [tensiDiastolik, setTensiDiastolik] = useState(initial?.tensiDiastolik?.toString() ?? '');
  const [gulaDarahPuasa, setGulaDarahPuasa] = useState(initial?.gulaDarahPuasa?.toString() ?? '');
  const [tinggiCm, setTinggiCm] = useState(initial?.tinggiCm?.toString() ?? '');
  const [beratKg, setBeratKg] = useState(initial?.beratKg?.toString() ?? '');
  const [lingkarPerutCm, setLingkarPerutCm] = useState(initial?.lingkarPerutCm?.toString() ?? '');
  const [sayurBuah, setSayurBuah] = useState(initial?.frekuensiSayurBuahPerMinggu?.toString() ?? '');
  const [aktivitas, setAktivitas] = useState(initial?.frekuensiAktivitasFisikPerMinggu?.toString() ?? '');
  const [merokok, setMerokok] = useState<SmokingHabit | null>(initial?.kebiasaanMerokok ?? null);
  const [riwayat, setRiwayat] = useState({
    hipertensi: initial?.riwayatKeluarga?.hipertensi ?? false,
    diabetes: initial?.riwayatKeluarga?.diabetes ?? false,
    jantung: initial?.riwayatKeluarga?.jantung ?? false,
    stroke: initial?.riwayatKeluarga?.stroke ?? false,
  });

  const toggleRiwayat = (key: keyof typeof riwayat) =>
    setRiwayat((prev) => ({ ...prev, [key]: !prev[key] }));

  const num = (v: string) => (v.trim() === '' ? undefined : Number(v));

  const handleSubmit = () => {
    onSubmit({
      tensiSistolik: num(tensiSistolik),
      tensiDiastolik: num(tensiDiastolik),
      gulaDarahPuasa: num(gulaDarahPuasa),
      tinggiCm: num(tinggiCm),
      beratKg: num(beratKg),
      lingkarPerutCm: num(lingkarPerutCm),
      frekuensiSayurBuahPerMinggu: num(sayurBuah),
      frekuensiAktivitasFisikPerMinggu: num(aktivitas),
      kebiasaanMerokok: merokok ?? undefined,
      riwayatKeluarga: riwayat,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: colors.backgroundCard }]} onPress={() => {}}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Update data kesehatan</Text>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.backgroundElement }]}>
              <Icon name="close" size="sm" color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Dipakai untuk menghitung level risiko & Target Kesehatan Anda. Isi sebisanya, tidak harus lengkap.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Tensi sistolik (mmHg)"
                  keyboardType="numeric"
                  value={tensiSistolik}
                  onChangeText={setTensiSistolik}
                  placeholder="120"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Tensi diastolik (mmHg)"
                  keyboardType="numeric"
                  value={tensiDiastolik}
                  onChangeText={setTensiDiastolik}
                  placeholder="80"
                />
              </View>
            </View>

            <TextField
              label="Gula darah puasa (mg/dL)"
              keyboardType="numeric"
              value={gulaDarahPuasa}
              onChangeText={setGulaDarahPuasa}
              placeholder="90"
              style={styles.fieldSpacing}
            />

            <View style={[styles.row, styles.fieldSpacing]}>
              <View style={{ flex: 1 }}>
                <TextField label="Tinggi (cm)" keyboardType="numeric" value={tinggiCm} onChangeText={setTinggiCm} placeholder="165" />
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="Berat (kg)" keyboardType="numeric" value={beratKg} onChangeText={setBeratKg} placeholder="65" />
              </View>
            </View>

            <TextField
              label="Lingkar perut (cm)"
              keyboardType="numeric"
              value={lingkarPerutCm}
              onChangeText={setLingkarPerutCm}
              placeholder="85"
              style={styles.fieldSpacing}
            />

            <View style={styles.fieldSpacing}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Kebiasaan merokok</Text>
              <View style={styles.chipRow}>
                {SMOKING_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    active={merokok === opt.value}
                    onPress={() => setMerokok(opt.value)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.fieldSpacing}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Riwayat keluarga</Text>
              <View style={styles.chipRow}>
                {FAMILY_HISTORY_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.key}
                    label={opt.label}
                    active={riwayat[opt.key]}
                    onPress={() => toggleRiwayat(opt.key)}
                  />
                ))}
              </View>
            </View>

            <View style={[styles.row, styles.fieldSpacing]}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Sayur/buah per minggu"
                  keyboardType="numeric"
                  value={sayurBuah}
                  onChangeText={setSayurBuah}
                  placeholder="5"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Olahraga per minggu"
                  keyboardType="numeric"
                  value={aktivitas}
                  onChangeText={setAktivitas}
                  placeholder="3"
                />
              </View>
            </View>
          </ScrollView>

          <Button label="Simpan" onPress={handleSubmit} loading={submitting} fullWidth style={styles.fieldSpacing} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  card: {
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.base },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: FontSize.lg, fontFamily: Fonts.bold },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontSize: FontSize.xs, lineHeight: 18, fontFamily: Fonts.regular, marginTop: 4, marginBottom: Spacing.base },
  scroll: { flexGrow: 0 },
  row: { flexDirection: 'row', gap: 10 },
  fieldSpacing: { marginTop: Spacing.base },
  fieldLabel: { fontSize: FontSize.xs, fontFamily: Fonts.medium, marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
