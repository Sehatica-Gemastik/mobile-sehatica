import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, useColorScheme, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { Device } from 'react-native-ble-plx';
import { recordsService } from '@/services/records.service';
import { doctorService } from '@/services/doctor.service';
import { recordTransferService } from '@/services/record-transfer.service';
import {
  connectDevice,
  disconnectDevice,
  ensureBluetoothOn,
  isBluetoothSupported,
  requestBluetoothPermissions,
  scanDevices,
  sendRecordFile,
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
  const [devices, setDevices] = useState<ScannedDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [progress, setProgress] = useState(0);

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

  useEffect(() => () => {
    void disconnectDevice(connectedDevice);
  }, [connectedDevice]);

  const selectedDoctor = partners.find((d) => d.id === selectedDoctorId) ?? null;

  const startScan = useCallback(async () => {
    if (!isBluetoothSupported()) {
      Alert.alert('Tidak didukung', 'Transfer Bluetooth hanya tersedia di aplikasi Android/iOS.');
      return;
    }

    const granted = await requestBluetoothPermissions();
    if (!granted) {
      Alert.alert('Izin ditolak', 'Izin Bluetooth diperlukan untuk transfer file.');
      return;
    }

    try {
      await ensureBluetoothOn();
    } catch (err) {
      Alert.alert('Bluetooth', err instanceof Error ? err.message : 'Bluetooth tidak siap');
      return;
    }

    setDevices([]);
    setScanning(true);
    const scan = scanDevices((device) => {
      setDevices((prev) => {
        if (prev.some((d) => d.id === device.id)) return prev;
        return [...prev, device].sort((a, b) => (b.rssi ?? -100) - (a.rssi ?? -100));
      });
    });

    await scan.done;
    setScanning(false);
  }, []);

  const handleConnect = async (deviceId: string) => {
    setConnectingId(deviceId);
    try {
      await disconnectDevice(connectedDevice);
      const device = await connectDevice(deviceId);
      setConnectedDevice(device);
      Alert.alert('Terhubung', 'Bluetooth siap untuk transfer file.');
    } catch (err) {
      Alert.alert('Gagal', err instanceof Error ? err.message : 'Tidak bisa terhubung');
    } finally {
      setConnectingId(null);
    }
  };

  const handleTransfer = async () => {
    if (!selectedDoctorId) {
      Alert.alert('Pilih dokter', 'Pilih dokter partner tujuan dulu.');
      return;
    }
    if (!connectedDevice) {
      Alert.alert('Belum terhubung', 'Scan dan hubungkan perangkat dokter via Bluetooth dulu.');
      return;
    }
    if (!selectedRecordId) {
      Alert.alert('Pilih dokumen', 'Pilih PDF rekam medis yang akan dikirim.');
      return;
    }

    const record = pdfRecords.find((r) => r.id === selectedRecordId);
    if (!record) return;

    setTransferring(true);
    setProgress(0);
    try {
      const file = await recordsService.getFile(record.id);
      if (!file || !file.mime.includes('pdf')) {
        throw new Error('File PDF tidak ditemukan di SQLite');
      }

      const fileName = `${record.title.replace(/[^\w.-]+/g, '_')}.pdf`;
      await sendRecordFile(
        connectedDevice,
        {
          recordId: record.id,
          title: record.title,
          fileName,
          mimeType: 'application/pdf',
          data: file.data,
        },
        (sent, total) => setProgress(total > 0 ? sent / total : 0),
      );

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

      Alert.alert(
        'Berhasil',
        syncedToPortal
          ? `PDF "${record.title}" dikirim via Bluetooth dan sudah tersedia di portal web dokter.`
          : `PDF "${record.title}" dikirim via Bluetooth, tapi gagal sync ke portal web. Coba ulang transfer saat online.`,
      );
      router.back();
    } catch (err) {
      Alert.alert('Gagal', err instanceof Error ? err.message : 'Transfer gagal');
    } finally {
      setTransferring(false);
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Hubungkan Bluetooth</Text>
            <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
              Pastikan perangkat dokter dalam mode pairing / BLE aktif.
            </Text>
            <Button
              label={scanning ? 'Memindai…' : connectedDevice ? 'Scan ulang perangkat' : 'Scan perangkat'}
              variant="secondary"
              onPress={() => void startScan()}
              loading={scanning}
              fullWidth
            />
            {connectedDevice ? (
              <View style={[styles.connectedPill, { backgroundColor: colors.primaryLight }]}>
                <Icon name="bluetooth" size="sm" color={colors.primary} />
                <Text style={[styles.connectedText, { color: colors.primaryDark }]}>
                  Terhubung ke {connectedDevice.name ?? connectedDevice.id}
                </Text>
              </View>
            ) : null}
            {devices.map((device) => (
              <TouchableOpacity
                key={device.id}
                onPress={() => void handleConnect(device.id)}
                disabled={connectingId === device.id}
                style={[styles.deviceRow, { borderColor: colors.borderLight }]}
              >
                <Icon name="bluetooth-outline" size="md" color={colors.primary} />
                <View style={styles.deviceCopy}>
                  <Text style={[styles.deviceName, { color: colors.text }]}>{device.name}</Text>
                  <Text style={[styles.deviceMeta, { color: colors.textMuted }]}>
                    {device.rssi != null ? `${device.rssi} dBm` : 'Sinyal —'}
                  </Text>
                </View>
                {connectingId === device.id
                  ? <ActivityIndicator size="small" color={colors.primary} />
                  : <Icon name="chevron-forward" size="sm" color={colors.textMuted} />}
              </TouchableOpacity>
            ))}
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

          {transferring ? (
            <View style={[styles.progressWrap, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.progressText, { color: colors.text }]}>
                Mengirim… {Math.round(progress * 100)}%
              </Text>
            </View>
          ) : null}

          <Button
            label="Kirim via Bluetooth"
            onPress={() => void handleTransfer()}
            loading={transferring}
            disabled={!selectedDoctorId || !connectedDevice || !selectedRecordId || Platform.OS === 'web'}
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
  connectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  connectedText: { fontSize: FontSize.xs, fontFamily: Fonts.medium, flex: 1 },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  deviceCopy: { flex: 1, gap: 2 },
  deviceName: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
  deviceMeta: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
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
