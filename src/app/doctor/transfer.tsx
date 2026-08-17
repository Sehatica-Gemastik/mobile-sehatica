import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, useColorScheme, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { recordsService } from '@/services/records.service';
import { doctorService } from '@/services/doctor.service';
import { recordTransferService } from '@/services/record-transfer.service';
import {
  isBluetoothSupported,
  isLikelyComputerReceiver,
  listPairedDevices,
  scanActiveDevices,
  sendPdfToPairedDevice,
  type ScannedDevice,
} from '@/services/bluetooth-transfer.service';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { AppScreen } from '@/components/screen-background';
import { useScreenTopPadding } from '@/hooks/use-screen-top-padding';
import { Button, Icon, surfaceHeaderShell } from '@/components/ui';
import { Doctor, MedicalRecord } from '@/types';
import { base64FromBytes } from '@/utils/read-document-file';

export default function RecordTransferScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const topPadding = useScreenTopPadding();

  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<ScannedDevice | null>(null);
  const [devices, setDevices] = useState<ScannedDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [progressLabel, setProgressLabel] = useState('');

  const { data: partners = [], isLoading: partnersLoading } = useQuery({
    queryKey: ['doctor-partners'],
    queryFn: doctorService.getPartners,
  });

  const { data: pdfRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ['records', 'pdf'],
    queryFn: () => recordsService.listPdfDocuments(),
  });

  useEffect(() => {
    if (partners.length === 1 && selectedDoctorId == null) {
      setSelectedDoctorId(partners[0].id);
    }
  }, [partners, selectedDoctorId]);

  const loadDevices = useCallback(async () => {
    if (!isBluetoothSupported()) {
      Alert.alert('Tidak didukung', 'Transfer Bluetooth hanya tersedia di Android.');
      return;
    }

    setLoadingDevices(true);
    try {
      const paired = await listPairedDevices();
      setDevices(paired);
      setSelectedDevice((current) => {
        if (current && paired.some((item) => item.address === current.address)) return current;
        return paired.length === 1 ? paired[0] : null;
      });
    } catch (err) {
      Alert.alert('Gagal', err instanceof Error ? err.message : 'Tidak bisa memuat perangkat Bluetooth');
    } finally {
      setLoadingDevices(false);
    }
  }, []);

  const scanDevices = useCallback(async () => {
    if (!isBluetoothSupported()) {
      Alert.alert('Tidak didukung', 'Transfer Bluetooth hanya tersedia di Android.');
      return;
    }

    setLoadingDevices(true);
    try {
      const found = await scanActiveDevices((partial) => {
        setDevices(partial);
      });
      setDevices(found);
      setSelectedDevice((current) => {
        if (current && found.some((item) => item.address === current.address)) return current;
        const nearby = found.find((item) => item.nearby);
        return nearby ?? (found.length === 1 ? found[0] : null);
      });
      if (found.length === 0) {
        Alert.alert(
          'Tidak ada perangkat aktif',
          'Nyalakan Bluetooth dan lokasi di HP ini. Di perangkat tujuan, nyalakan Bluetooth dan buat terlihat. MacBook tidak bisa menerima file dari Android.',
        );
      }
    } catch (err) {
      Alert.alert('Gagal', err instanceof Error ? err.message : 'Scan Bluetooth gagal');
    } finally {
      setLoadingDevices(false);
    }
  }, []);

  useEffect(() => {
    void loadDevices();
  }, [loadDevices]);

  const selectedDoctor = partners.find((d) => d.id === selectedDoctorId) ?? null;

  const handleTransfer = async () => {
    if (!selectedDoctorId) {
      Alert.alert('Pilih dokter', 'Pilih dokter partner tujuan dulu.');
      return;
    }
    if (!selectedDevice) {
      Alert.alert('Pilih perangkat', 'Scan lalu pilih perangkat Bluetooth yang aktif.');
      return;
    }
    if (!selectedRecordId) {
      Alert.alert('Pilih dokumen', 'Pilih PDF rekam medis yang akan dikirim.');
      return;
    }

    const record = pdfRecords.find((r) => r.id === selectedRecordId);
    if (!record) return;

    setTransferring(true);
    setProgressLabel('Menyiapkan PDF...');
    try {
      const file = await recordsService.getFile(record.id);
      if (!file || !file.mime.includes('pdf')) {
        throw new Error('File PDF tidak ditemukan di SQLite');
      }

      const fileName = `${record.title.replace(/[^\w.-]+/g, '_')}.pdf`;
      const skipNearbySend = isLikelyComputerReceiver(selectedDevice.name);

      if (!skipNearbySend) {
        setProgressLabel(`Mengirim ke ${selectedDevice.name}...`);
        try {
          await sendPdfToPairedDevice({
            address: selectedDevice.address,
            fileName,
            mimeType: 'application/pdf',
            data: file.data,
          });
        } catch {
          // portal sync still proceeds
        }
      }

      setProgressLabel('Mengirim ke portal dokter...');
      let syncedToPortal = false;
      try {
        await recordTransferService.logTransfer(selectedDoctorId, {
          recordId: record.id,
          recordTitle: record.title,
          fileName,
          byteSize: file.data.byteLength,
          fileBase64: base64FromBytes(file.data),
        });
        syncedToPortal = true;
      } catch {
        syncedToPortal = false;
      }

      if (!syncedToPortal) {
        throw new Error('Gagal mengirim ke portal web dokter. Coba ulang saat online.');
      }

      Alert.alert(
        'Terkirim ke portal dokter',
        skipNearbySend
          ? `Mac/laptop tidak bisa menerima file Bluetooth dari Android. PDF "${record.title}" sudah masuk portal web dokter.`
          : `PDF "${record.title}" sudah masuk portal web dokter. Jika tujuan HP Android, terima file di notifikasi Bluetooth.`,
      );
      router.back();
    } catch (err) {
      Alert.alert('Gagal', err instanceof Error ? err.message : 'Transfer gagal');
    } finally {
      setTransferring(false);
      setProgressLabel('');
    }
  };

  return (
    <AppScreen style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <View style={[styles.header, surfaceHeaderShell(colors), { paddingTop: topPadding, backgroundColor: colors.backgroundCard }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-back" size="md" color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>Transfer file</Text>
            <Text style={[styles.sub, { color: colors.textMuted }]} numberOfLines={1}>
              {selectedDoctor
                ? `Ke ${selectedDoctor.name} via Bluetooth`
                : 'Kirim PDF ke dokter partner via Bluetooth'}
            </Text>
          </View>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.section, Shadows.sm, { backgroundColor: colors.backgroundCard }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Pilih dokter partner</Text>
            {partnersLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : partners.length === 0 ? (
              <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
                Belum ada partner. Tambah dokter dulu di tab Dokter.
              </Text>
            ) : (
              partners.map((doctor: Doctor) => {
                const active = selectedDoctorId === doctor.id;
                return (
                  <TouchableOpacity
                    key={doctor.id}
                    onPress={() => setSelectedDoctorId(doctor.id)}
                    style={[
                      styles.recordRow,
                      {
                        borderColor: active ? colors.primary : colors.borderLight,
                        backgroundColor: active ? colors.primaryLight : colors.backgroundElement,
                      },
                    ]}
                  >
                    <Icon name="medkit-outline" size="md" color={colors.primary} />
                    <View style={styles.recordCopy}>
                      <Text style={[styles.recordTitle, { color: colors.text }]} numberOfLines={1}>
                        {doctor.name}
                      </Text>
                      <Text style={[styles.recordMeta, { color: colors.textMuted }]}>
                        {doctor.specialty}
                      </Text>
                    </View>
                    {active ? <Icon name="checkmark-circle" size="sm" color={colors.primary} /> : null}
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <View style={[styles.section, Shadows.sm, { backgroundColor: colors.backgroundCard }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Pilih perangkat Bluetooth</Text>
            <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
              Scan perangkat aktif di sekitar. Kirim file Bluetooth hanya ke HP Android. MacBook/iPhone tidak bisa menerima file dari Android; dokumen tetap masuk portal web dokter.
            </Text>
            <Button
              label={loadingDevices ? 'Memindai...' : 'Scan perangkat aktif'}
              variant="secondary"
              onPress={() => void scanDevices()}
              loading={loadingDevices}
              fullWidth
            />
            {devices.map((device) => {
              const active = selectedDevice?.address === device.address;
              const status = [
                device.nearby ? 'Aktif' : null,
                device.paired ? 'Terpasang' : null,
                isLikelyComputerReceiver(device.name) ? 'Tidak bisa terima file' : null,
              ].filter(Boolean).join(' · ');
              return (
                <TouchableOpacity
                  key={device.address}
                  onPress={() => setSelectedDevice(device)}
                  style={[
                    styles.recordRow,
                    {
                      borderColor: active ? colors.primary : colors.borderLight,
                      backgroundColor: active ? colors.primaryLight : colors.backgroundElement,
                    },
                  ]}
                >
                  <Icon name="bluetooth-outline" size="md" color={colors.primary} />
                  <View style={styles.recordCopy}>
                    <Text style={[styles.recordTitle, { color: colors.text }]}>{device.name}</Text>
                    <Text style={[styles.recordMeta, { color: colors.textMuted }]}>{status}</Text>
                  </View>
                  {active ? <Icon name="checkmark-circle" size="sm" color={colors.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.section, Shadows.sm, { backgroundColor: colors.backgroundCard }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Pilih PDF rekam medis</Text>
            {recordsLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : pdfRecords.length === 0 ? (
              <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
                Belum ada PDF. Upload dulu di tab Rekam.
              </Text>
            ) : (
              pdfRecords.map((record: MedicalRecord) => {
                const active = selectedRecordId === record.id;
                return (
                  <TouchableOpacity
                    key={record.id}
                    onPress={() => setSelectedRecordId(record.id)}
                    style={[
                      styles.recordRow,
                      {
                        borderColor: active ? colors.primary : colors.borderLight,
                        backgroundColor: active ? colors.primaryLight : colors.backgroundElement,
                      },
                    ]}
                  >
                    <Icon name="document-text-outline" size="md" color={colors.primary} />
                    <View style={styles.recordCopy}>
                      <Text style={[styles.recordTitle, { color: colors.text }]} numberOfLines={1}>
                        {record.title}
                      </Text>
                      <Text style={[styles.recordMeta, { color: colors.textMuted }]}>
                        {new Date(record.createdAt).toLocaleDateString('id-ID')}
                      </Text>
                    </View>
                    {active ? <Icon name="checkmark-circle" size="sm" color={colors.primary} /> : null}
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {transferring && progressLabel ? (
            <View style={[styles.progressWrap, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.progressText, { color: colors.text }]}>{progressLabel}</Text>
            </View>
          ) : null}

          <Button
            label="Kirim via Bluetooth"
            onPress={() => void handleTransfer()}
            loading={transferring}
            disabled={!selectedDoctorId || !selectedDevice || !selectedRecordId || Platform.OS === 'web'}
            fullWidth
          />
        </ScrollView>
      </SafeAreaView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, gap: 2 },
  title: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  sub: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  section: { borderRadius: BorderRadius.xl, padding: Spacing.base, gap: Spacing.sm },
  sectionTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  sectionHint: { fontSize: FontSize.xs, lineHeight: 16, fontFamily: Fonts.regular },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  recordCopy: { flex: 1, gap: 2 },
  recordTitle: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
  recordMeta: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  progressWrap: { borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center' },
  progressText: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
});
