import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity, TextInput,
  Platform, useColorScheme, ActivityIndicator, Alert,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, nativeReset } from '@/constants/theme';
import { Icon } from '@/components/ui';

type Props = {
  visible: boolean;
  onClose: () => void;
  onScan: (code: string) => Promise<void> | void;
  loading?: boolean;
};

export function DoctorQrScanner({ visible, onClose, onScan, loading }: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const [permission, requestPermission] = useCameraPermissions();
  const [manualCode, setManualCode] = useState('');
  const [useManual, setUseManual] = useState(Platform.OS === 'web');
  const locked = useRef(false);

  const handleBarcode = useCallback(
    async (result: BarcodeScanningResult) => {
      if (locked.current || loading) return;
      const raw = result.data?.trim();
      if (!raw) return;
      locked.current = true;
      try {
        await onScan(raw);
      } finally {
        setTimeout(() => {
          locked.current = false;
        }, 1500);
      }
    },
    [loading, onScan]
  );

  const submitManual = async () => {
    const code = manualCode.trim();
    if (!code) {
      Alert.alert('Perhatian', 'Masukkan kode dokter');
      return;
    }
    await onScan(code);
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Izin kamera', 'Izinkan kamera untuk scan QR dokter');
        return;
      }
    }
    setUseManual(false);
  };

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

        {!useManual && Platform.OS !== 'web' && permission?.granted ? (
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
            {loading ? (
              <View style={styles.loadingMask}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.manualWrap}>
            <View style={[styles.manualCard, { backgroundColor: colors.backgroundElement }]}>
              <Icon name="qr-code-outline" size="lg" color={colors.primary} />
              <Text style={[styles.manualTitle, { color: colors.text }]}>Masukkan kode dokter</Text>
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
                disabled={loading}
                style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
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
              <TouchableOpacity onPress={openCamera} style={styles.switchBtn} activeOpacity={0.7}>
                <Icon name="camera-outline" size="sm" color={colors.primary} />
                <Text style={[styles.switchText, { color: colors.primary }]}>Gunakan kamera</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {!useManual && Platform.OS !== 'web' ? (
          <TouchableOpacity
            onPress={() => setUseManual(true)}
            style={[styles.footerBtn, { borderTopColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Atau masukkan kode manual
            </Text>
          </TouchableOpacity>
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
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  switchText: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
  footerBtn: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
  },
  footerText: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
});
