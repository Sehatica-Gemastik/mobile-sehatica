import React from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, useColorScheme, Pressable,
} from 'react-native';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { Button, Icon } from '@/components/ui';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Ya, lanjutkan',
  cancelLabel = 'Batal',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={[styles.card, Shadows.md, { backgroundColor: colors.backgroundCard }]} onPress={() => undefined}>
          <View style={[styles.iconWrap, { backgroundColor: destructive ? '#FEE2E2' : colors.primaryLight }]}>
            <Icon
              name={destructive ? 'trash-outline' : 'help-circle-outline'}
              size="md"
              color={destructive ? '#DC2626' : colors.primary}
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={[styles.cancelBtn, { borderColor: colors.borderLight }]}>
              <Text style={[styles.cancelText, { color: colors.text }]}>{cancelLabel}</Text>
            </TouchableOpacity>
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              loading={loading}
              style={destructive ? styles.confirmBtnDanger : styles.confirmBtn}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: FontSize.md,
    fontFamily: Fonts.bold,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.sm,
    lineHeight: 21,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: FontSize.sm, fontFamily: Fonts.semibold },
  confirmBtn: { flex: 1 },
  confirmBtnDanger: { flex: 1, backgroundColor: '#DC2626' },
});
