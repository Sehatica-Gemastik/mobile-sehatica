import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity, TextInput,
  Platform, useColorScheme, ActivityIndicator, Alert,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  scanFromURLAsync,
  type BarcodeScanningResult,
} from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, nativeReset } from '@/constants/theme';
import { Icon } from '@/components/ui';

type Props = {
  visible: boolean;
  onClose: () => void;
  onScan: (code: string) => Promise<void> | void;
  loading?: boolean;
};

type ScanMode = 'camera' | 'manual';

export function DoctorQrScanner({ visible, onClose, onScan, loading }: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const [permission, requestPermission] = useCameraPermissions();
  const [manualCode, setManualCode] = useState('');
  const [mode, setMode] = useState<ScanMode>(Platform.OS === 'web' ? 'manual' : 'camera');
  const [requestingPermission, setRequestingPermission] = useState(false);
  const [scanningImage, setScanningImage] = useState(false);
  const locked = useRef(false);

  useEffect(() => {
    if (!visible) return;
    locked.current = false;
    setManualCode('');
    if (Platform.OS === 'web') {
      setMode('manual');
      return;
    }
    setMode('camera');
    setRequestingPermission(true);
    void requestPermission().finally(() => setRequestingPermission(false));
  }, [visible, requestPermission]);

  const processCode = useCallback(async (raw: string) => {
    if (locked.current || loading) return;
    const code = raw.trim();
    if (!code) return;
    locked.current = true;
    try {
      await onScan(code);
    } finally {
      setTimeout(() => {
        locked.current = false;
      }, 1500);
    }
  }, [loading, onScan]);

  const handleBarcode = useCallback(
    async (result: BarcodeScanningResult) => {
      await processCode(result.data ?? '');
    },
    [processCode]
  );

  const submitManual = async () => {
    await processCode(manualCode);
  };

  const pickQrFromGallery = async () => {
    if (loading || scanningImage) return;

    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!mediaPermission.granted) {
      Alert.alert('Izin galeri', 'Izinkan akses galeri untuk memilih foto QR dokter.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    setScanningImage(true);
    try {
      const scans = await scanFromURLAsync(result.assets[0].uri, ['qr']);
      if (scans.length === 0 || !scans[0]?.data) {
        Alert.alert('QR tidak ditemukan', 'Pastikan foto berisi QR dokter yang jelas.');
        return;
      }
      await processCode(scans[0].data);
    } catch {
      Alert.alert('Gagal', 'Tidak bisa membaca QR dari foto. Coba foto yang lebih jelas.');
    } finally {
      setScanningImage(false);
    }
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      setRequestingPermission(true);
      const res = await requestPermission();
      setRequestingPermission(false);
      if (!res.granted) {
        Alert.alert('Izin kamera', 'Izinkan kamera untuk scan QR dokter.');
        return;
      }
    }
    setMode('camera');
  };

  const showCamera = mode === 'camera' && Platform.OS !== 'web' && permission?.granted;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={[styles.iconBtn, { backgroundColor: colors.backgroundElement }]} activeOpacity={0.7}>
            <Icon name="close" size="md" color={colors.text} />
          </TouchableOpacity>
          <View style={styles.topText}>
            <Text style={[styles.title, { color: colors.text }]}>Scan QR dokter</Text>
            <Text style={[styles.sub, { color: colors.textMuted }]}>Tambah sebagai partner</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {showCamera ? (
          <View style={styles.cameraWrap}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarcode}
            />
            <View style={styles.overlay}>
              <View style={[styles.frame, { borderColor: colors.primary }]} />
              <Text style={styles.hint}>Arahkan kamera ke QR dokter</Text>
            </View>
            {(loading || scanningImage) ? (
              <View style={styles.loadingMask}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.manualWrap}>
            {requestingPermission ? (
              <ActivityIndicator color={colors.primary} style={{ marginBottom: Spacing.base }} />
            ) : null}

            <View style={[styles.manualCard, { backgroundColor: colors.backgroundElement }]}>
              <Icon name="qr-code-outline" size="lg" color={colors.primary} />
              <Text style={[styles.manualTitle, { color: colors.text }]}>
                {Platform.OS === 'web' ? 'Masukkan kode dokter' : 'Scan QR dokter'}
              </Text>
              <Text style={[styles.manualDesc, { color: colors.textSecondary }]}>
                Format: sehatica:doctor:ID atau DOC-ID
              </Text>
              <TextInput
                value={manualCode}
                onChangeText={setManualCode}
                placeholder="sehatica:doctor:1"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                underlineColorAndroid="transparent"
                selectionColor={colors.primary}
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              />
              <TouchableOpacity
                onPress={submitManual}
                disabled={loading || scanningImage}
                style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading || scanningImage ? 0.6 : 1 }]}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="person-add-outline" size="sm" color={colors.onPrimary} />
                    <Text style={styles.primaryBtnText}>Tambah partner</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {Platform.OS !== 'web' ? (
              <View style={styles.altActions}>
                <TouchableOpacity onPress={openCamera} style={styles.switchBtn} activeOpacity={0.7}>
                  <Icon name="camera-outline" size="sm" color={colors.primary} />
                  <Text style={[styles.switchText, { color: colors.primary }]}>Gunakan kamera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={pickQrFromGallery}
                  disabled={loading || scanningImage}
                  style={styles.switchBtn}
                  activeOpacity={0.7}
                >
                  <Icon name="image-outline" size="sm" color={colors.primary} />
                  <Text style={[styles.switchText, { color: colors.primary }]}>Pilih foto QR</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}

        {showCamera ? (
          <View style={[styles.footerActions, { borderTopColor: colors.border }]}>
            <TouchableOpacity onPress={pickQrFromGallery} style={styles.footerBtn} activeOpacity={0.7}>
              <Icon name="image-outline" size="sm" color={colors.primary} />
              <Text style={[styles.footerText, { color: colors.primary }]}>Pilih foto QR</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode('manual')} style={styles.footerBtn} activeOpacity={0.7}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>Masukkan kode manual</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topText: { flex: 1, alignItems: 'center' },
  title: { fontSize: FontSize.md, fontFamily: Fonts.bold },
  sub: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  cameraWrap: { flex: 1, overflow: 'hidden', marginHorizontal: Spacing.lg, borderRadius: BorderRadius.lg },
  overlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 16 },
  frame: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    backgroundColor: 'transparent',
  },
  hint: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontFamily: Fonts.medium,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
  loadingMask: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualWrap: { flex: 1, padding: Spacing.lg, justifyContent: 'center', gap: Spacing.base },
  manualCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  manualTitle: { fontSize: FontSize.md, fontFamily: Fonts.bold, marginTop: Spacing.sm },
  manualDesc: { fontSize: FontSize.xs, fontFamily: Fonts.regular, textAlign: 'center', marginBottom: Spacing.sm },
  input: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FontSize.sm,
    fontFamily: Fonts.regular,
    ...(Platform.OS === 'web' ? nativeReset : null),
  },
  primaryBtn: {
    alignSelf: 'stretch',
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  primaryBtnText: { color: '#fff', fontFamily: Fonts.bold, fontSize: FontSize.sm },
  altActions: { gap: 4 },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  switchText: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
  footerActions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.xxl,
    gap: 4,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  footerText: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
});
