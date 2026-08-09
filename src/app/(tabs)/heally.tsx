import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, useColorScheme,
  ActivityIndicator, Alert, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { heallyService } from '@/services/heally.service';
import { doctorService } from '@/services/doctor.service';
import { reviewService } from '@/services/review.service';
import { useHeallyStore } from '@/store/heally-store';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, nativeReset } from '@/constants/theme';
import { ChatBubble } from '@/components/chat-bubble';
import { TypingIndicator } from '@/components/typing-indicator';
import { Icon, IconName } from '@/components/ui';
import { ChatMessage } from '@/types';

const SUGGESTIONS = [
  'Cek interaksi obat saya',
  'Buat jadwal olahraga',
  'Tips diet untuk kondisi saya',
  'Analisis rekam medis saya',
  'Gejala yang perlu diwaspadai',
];

const WA_FEATURES: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'chatbubble-outline', title: 'Kirim pesan via WhatsApp', desc: 'Tanya kesehatan langsung dari WA Anda' },
  { icon: 'sparkles-outline', title: 'Heally membalas otomatis', desc: 'Berdasarkan rekam medis & data kesehatan' },
  { icon: 'medkit-outline', title: 'Verifikasi dokter tersedia', desc: 'Respons kritis bisa dikirim ke dokter' },
  { icon: 'sync-outline', title: 'Riwayat tersinkronisasi', desc: 'Percakapan WA muncul di tab Chat' },
];

export default function HeallyScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const listRef = useRef<ScrollView>(null);
  const [reviewMessage, setReviewMessage] = useState<ChatMessage | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [patientNote, setPatientNote] = useState('');

  const {
    messages, isTyping, activeTab, input,
    setMessages, addMessage,
    setTyping, setActiveTab, setInput,
  } = useHeallyStore();

  const { error: messagesError, isLoading } = useQuery({
    queryKey: ['heally-messages'],
    queryFn: async () => {
      const msgs = await heallyService.getMessages();
      setMessages(msgs);
      return msgs;
    },
    staleTime: 0,
  });

  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorService.getAll,
    enabled: Boolean(reviewMessage),
  });
  const availableDoctors = doctors.filter((doctor) => doctor.isAvailable);
  const effectiveDoctorId = selectedDoctorId ?? availableDoctors[0]?.id ?? null;

  useQuery({
    queryKey: ['reviews', 'mine'],
    queryFn: async () => {
      const synced = await reviewService.syncMine();
      setMessages(synced);
      return synced.length;
    },
    retry: 1,
  });

  const sendMutation = useMutation({
    mutationFn: heallyService.replyTo,
    onSuccess: (aiMessage) => {
      setTyping(false);
      addMessage(aiMessage);
    },
    onError: (err: any) => {
      setTyping(false);
      Alert.alert('Pesan tersimpan', err.message ?? 'Heally membutuhkan internet untuk menjawab. Coba lagi nanti.');
    },
  });

  const clearMutation = useMutation({
    mutationFn: heallyService.clear,
    onSuccess: () => setMessages([]),
    onError: (err: Error) => Alert.alert('Gagal', err.message),
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!reviewMessage) throw new Error('Jawaban Heally tidak tersedia');
      const doctor = doctors.find((item) => item.id === effectiveDoctorId);
      if (!doctor) throw new Error('Pilih dokter yang tersedia');
      const messageIndex = messages.findIndex((item) => item.id === reviewMessage.id);
      const patientQuestion = messages
        .slice(0, messageIndex)
        .reverse()
        .find((item) => item.role === 'user')?.content;
      if (!patientQuestion) throw new Error('Pertanyaan terkait tidak ditemukan');
      await reviewService.submit(reviewMessage, patientQuestion, doctor, patientNote);
      return reviewService.markPending(reviewMessage.id, doctor.name);
    },
    onSuccess: (synced) => {
      setMessages(synced);
      setReviewMessage(null);
      setSelectedDoctorId(null);
      setPatientNote('');
      Alert.alert('Terkirim', 'Dokter dapat melihat jawaban yang Anda setujui selama 7 hari.');
    },
    onError: (error: Error) => Alert.alert('Review gagal dikirim', error.message),
  });

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || sendMutation.isPending || isTyping) return;
    setInput('');
    setTyping(true);
    try {
      const userMessage = await heallyService.saveUserMessage(msg);
      addMessage(userMessage);
      // ponytail: failed replies leave the question local; add explicit retry when offline queue UX is defined.
      sendMutation.mutate(userMessage);
    } catch (error) {
      setTyping(false);
      Alert.alert('Gagal', error instanceof Error ? error.message : 'Pesan tidak dapat disimpan');
    }
  };

  const confirmClear = () => Alert.alert(
    'Hapus percakapan?',
    'Semua riwayat Heally di perangkat ini akan dihapus.',
    [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => clearMutation.mutate() },
    ]
  );

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 100);
  }, [messages.length, isTyping]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View style={styles.heallyInfo}>
            <View style={[styles.heallyAvatar, { backgroundColor: colors.primary }]}>
              <Icon name="sparkles" size="md" color={colors.onPrimary} />
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={[styles.heallyName, { color: colors.text }]}>Heally</Text>
              <Text style={[styles.heallyStatus, { color: colors.textMuted }]}>
                AI kesehatan · Perlu verifikasi dokter
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <View style={[styles.aiBadge, { backgroundColor: colors.amberLight, borderColor: '#FDE68A' }]}>
              <View style={styles.aiBadgeDot} />
              <Text style={[styles.aiBadgeText, { color: colors.amber }]}>AI</Text>
            </View>
            {messages.length > 0 ? (
              <TouchableOpacity
                accessibilityLabel="Hapus percakapan Heally"
                disabled={isTyping}
                onPress={confirmClear}
                style={[styles.clearButton, {
                  backgroundColor: colors.backgroundElement,
                  opacity: isTyping ? 0.45 : 1,
                }]}
              >
                <Icon name="trash-outline" size="sm" color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={[styles.tabSwitcher, { backgroundColor: colors.backgroundElement }]}>
          {[
            { id: 'chat' as const, label: 'Chat', icon: 'chatbubble-outline' as IconName },
            { id: 'whatsapp' as const, label: 'WhatsApp', icon: 'logo-whatsapp' as IconName },
          ].map(({ id, label, icon }) => (
            <TouchableOpacity
              key={id}
              onPress={() => setActiveTab(id)}
              style={[
                styles.tabBtn,
                activeTab === id && { backgroundColor: colors.backgroundCard },
              ]}
              activeOpacity={0.7}
            >
              <Icon
                name={icon}
                size="sm"
                color={activeTab === id ? colors.text : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === id ? colors.text : colors.textSecondary },
                  activeTab === id && styles.tabBtnTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      {activeTab === 'chat' ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : messagesError ? (
            <View style={styles.center}>
              <Text style={[styles.loadError, { color: colors.textSecondary }]}>
                {messagesError instanceof Error ? messagesError.message : 'Riwayat Heally tidak tersedia'}
              </Text>
            </View>
          ) : (
            <ScrollView
              ref={listRef}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: true })}
            >
              {messages.length === 0 && (
                <View style={[styles.welcomeCard, { backgroundColor: colors.primaryLight }]}>
                  <Icon name="hand-left-outline" size="lg" color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.welcomeTitle, { color: colors.primary }]}>Halo! Saya Heally</Text>
                    <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                      Asisten kesehatan AI Anda. Tanya rekam medis, jadwal, atau gejala.
                    </Text>
                  </View>
                </View>
              )}

              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  onRequestVerif={setReviewMessage}
                  isVerifLoading={submitReviewMutation.isPending}
                />
              ))}

              {isTyping && <TypingIndicator />}
            </ScrollView>
          )}

          {messages.length <= 3 && !isTyping && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestions}
            >
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setInput(s)}
                  style={[styles.suggestionChip, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={input}
                onChangeText={setInput}
                placeholder="Tanya Heally..."
                placeholderTextColor={colors.textMuted}
                multiline
                onSubmitEditing={handleSend}
                underlineColorAndroid="transparent"
                selectionColor={colors.primary}
              />
            </View>
            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || sendMutation.isPending || isTyping}
              style={[
                styles.sendBtn,
                { backgroundColor: input.trim() ? colors.primary : colors.backgroundElement },
              ]}
              activeOpacity={0.8}
            >
              {sendMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Icon
                  name="send"
                  size="sm"
                  color={input.trim() ? colors.onPrimary : colors.textMuted}
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView contentContainerStyle={styles.waContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.waConnected, { backgroundColor: colors.primaryLight, borderColor: colors.primaryMuted }]}>
            <Icon name="logo-whatsapp" size="lg" color={colors.whatsapp} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.waTitle, { color: colors.text }]}>WhatsApp belum tersedia</Text>
              <Text style={[styles.waPhone, { color: colors.textSecondary }]}>Tidak ada nomor yang terhubung</Text>
            </View>
          </View>

          {WA_FEATURES.map((item, i) => (
            <View key={i} style={styles.waFeature}>
              <View style={[styles.waFeatureIcon, { backgroundColor: colors.backgroundElement }]}>
                <Icon name={item.icon} size="md" color={colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.waFeatureTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.waFeatureDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity disabled style={[styles.waBtn, { backgroundColor: colors.backgroundElement }]}>
            <Icon name="logo-whatsapp" size="md" color={colors.textMuted} />
            <Text style={[styles.waBtnText, { color: colors.textMuted }]}>Segera hadir</Text>
          </TouchableOpacity>

          <View style={styles.waNote}>
            <Text style={[styles.waNoteText, { color: colors.textMuted }]}>
              Fitur WhatsApp akan segera tersedia
            </Text>
          </View>
        </ScrollView>
      )}

      <Modal
        transparent
        animationType="fade"
        visible={Boolean(reviewMessage)}
        onRequestClose={() => setReviewMessage(null)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setReviewMessage(null)} />
          <View style={[styles.reviewCard, { backgroundColor: colors.backgroundCard }]}>
            <View style={styles.reviewHeader}>
              <View style={[styles.reviewIcon, { backgroundColor: colors.primaryLight }]}>
                <Icon name="shield-checkmark-outline" size="md" color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.reviewTitle, { color: colors.text }]}>Minta review dokter</Text>
                <Text style={[styles.reviewSubtitle, { color: colors.textSecondary }]}>Persetujuan berlaku untuk jawaban ini saja</Text>
              </View>
              <TouchableOpacity accessibilityLabel="Tutup" onPress={() => setReviewMessage(null)}>
                <Icon name="close" size="md" color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.consentBox, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.consentText, { color: colors.primaryDark }]}>Yang dikirim hanya pertanyaan Anda, jawaban Heally, level keamanan, dan catatan di bawah. Rekam medis lain tetap di perangkat.</Text>
            </View>

            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Pilih dokter</Text>
            {doctorsLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : availableDoctors.length === 0 ? (
              <Text style={[styles.reviewEmpty, { color: colors.textMuted }]}>Belum ada dokter yang tersedia.</Text>
            ) : (
              <ScrollView style={styles.doctorPicker} showsVerticalScrollIndicator={false}>
                {availableDoctors.map((doctor) => {
                  const selected = effectiveDoctorId === doctor.id;
                  return (
                    <TouchableOpacity
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      key={doctor.id}
                      onPress={() => setSelectedDoctorId(doctor.id)}
                      style={[
                        styles.doctorOption,
                        { borderColor: selected ? colors.primary : colors.border },
                        selected && { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <View style={[styles.doctorAvatar, { backgroundColor: colors.backgroundElement }]}>
                        <Text style={[styles.doctorAvatarText, { color: colors.primary }]}>{doctor.avatarInitials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.doctorOptionName, { color: colors.text }]}>{doctor.name}</Text>
                        <Text style={[styles.doctorOptionMeta, { color: colors.textSecondary }]}>{doctor.specialty} · {doctor.verifiedCount} review</Text>
                      </View>
                      <Icon name={selected ? 'radio-button-on' : 'radio-button-off'} size="md" color={selected ? colors.primary : colors.textMuted} />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Catatan untuk dokter (opsional)</Text>
            <TextInput
              value={patientNote}
              onChangeText={setPatientNote}
              maxLength={1000}
              multiline
              placeholder="Contoh: Saya ingin memastikan saran olahraga ini aman."
              placeholderTextColor={colors.textMuted}
              style={[styles.reviewNote, { color: colors.text, borderColor: colors.border }]}
            />

            <View style={styles.reviewActions}>
              <TouchableOpacity style={[styles.reviewCancel, { borderColor: colors.border }]} onPress={() => setReviewMessage(null)}>
                <Text style={[styles.reviewCancelText, { color: colors.textSecondary }]}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!effectiveDoctorId || submitReviewMutation.isPending}
                onPress={() => submitReviewMutation.mutate()}
                style={[styles.reviewSubmit, { backgroundColor: colors.primary, opacity: effectiveDoctorId ? 1 : 0.45 }]}
              >
                {submitReviewMutation.isPending ? <ActivityIndicator color="white" /> : <Text style={styles.reviewSubmitText}>Setujui dan kirim</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.sm,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clearButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  heallyInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heallyAvatar: {
    width: 40, height: 40, borderRadius: BorderRadius.sm,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  onlineDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#4ADE80', borderWidth: 2, borderColor: 'white',
  },
  heallyName: { fontSize: FontSize.lg, fontFamily: Fonts.bold },
  heallyStatus: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: 1,
  },
  aiBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D97706' },
  aiBadgeText: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  tabSwitcher: {
    flexDirection: 'row', margin: Spacing.sm, marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full, padding: 4,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', gap: 6, paddingVertical: 8,
    alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.full,
  },
  tabBtnText: { fontSize: FontSize.xs, fontFamily: Fonts.medium },
  tabBtnTextActive: { fontFamily: Fonts.bold },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadError: { padding: Spacing.xl, textAlign: 'center', fontSize: FontSize.sm, fontFamily: Fonts.medium },
  messagesList: { padding: Spacing.base, paddingBottom: Spacing.lg },
  welcomeCard: {
    flexDirection: 'row', gap: 12, padding: 14,
    borderRadius: BorderRadius.md, marginBottom: 12, alignItems: 'flex-start',
  },
  welcomeTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold, marginBottom: 4 },
  welcomeText: { fontSize: FontSize.xs, lineHeight: 17, fontFamily: Fonts.regular },
  suggestions: { paddingHorizontal: Spacing.base, paddingVertical: 8, gap: 8 },
  suggestionChip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  suggestionText: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: Spacing.base, paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth, paddingBottom: 24,
  },
  inputWrapper: { flex: 1, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 10 },
  input: {
    fontSize: FontSize.sm, lineHeight: 20, maxHeight: 96, fontFamily: Fonts.regular, padding: 0,
    ...(Platform.OS === 'web' ? nativeReset : null),
  },
  sendBtn: { width: 44, height: 44, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  waContent: { padding: Spacing.lg, gap: Spacing.base, paddingBottom: 100 },
  waConnected: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.base, borderRadius: BorderRadius.md, borderWidth: 1,
  },
  waTitle: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  waPhone: { fontSize: FontSize.xs, marginTop: 2, fontFamily: Fonts.regular },
  waFeature: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  waFeatureIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.sm,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  waFeatureTitle: { fontSize: FontSize.sm, fontFamily: Fonts.medium },
  waFeatureDesc: { fontSize: FontSize.xs, marginTop: 2, fontFamily: Fonts.regular },
  waBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: BorderRadius.md,
  },
  waBtnText: { color: 'white', fontFamily: Fonts.bold, fontSize: FontSize.md },
  waNote: { alignItems: 'center' },
  waNoteText: { fontSize: FontSize.xs, textAlign: 'center', fontFamily: Fonts.regular },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 35, 31, 0.48)' },
  reviewCard: {
    maxHeight: '88%', padding: Spacing.lg, paddingBottom: 28,
    borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, gap: 12,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewIcon: { width: 40, height: 40, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  reviewTitle: { fontSize: FontSize.lg, fontFamily: Fonts.bold },
  reviewSubtitle: { fontSize: FontSize.xs, fontFamily: Fonts.regular, marginTop: 2 },
  consentBox: { borderRadius: BorderRadius.sm, padding: 12 },
  consentText: { fontSize: FontSize.xs, lineHeight: 18, fontFamily: Fonts.medium },
  reviewLabel: { fontSize: FontSize.xs, fontFamily: Fonts.bold },
  reviewEmpty: { fontSize: FontSize.sm, fontFamily: Fonts.regular, textAlign: 'center', padding: 16 },
  doctorPicker: { maxHeight: 176 },
  doctorOption: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: BorderRadius.md, padding: 10, marginBottom: 8 },
  doctorAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  doctorAvatarText: { fontSize: FontSize.xs, fontFamily: Fonts.bold },
  doctorOptionName: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  doctorOptionMeta: { fontSize: FontSize.xs, fontFamily: Fonts.regular, marginTop: 2 },
  reviewNote: { minHeight: 76, borderWidth: 1, borderRadius: BorderRadius.md, padding: 12, textAlignVertical: 'top', fontSize: FontSize.sm, fontFamily: Fonts.regular },
  reviewActions: { flexDirection: 'row', gap: 10, marginTop: 2 },
  reviewCancel: { borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: 18, minHeight: 46, alignItems: 'center', justifyContent: 'center' },
  reviewCancelText: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  reviewSubmit: { flex: 1, borderRadius: BorderRadius.md, minHeight: 46, alignItems: 'center', justifyContent: 'center' },
  reviewSubmitText: { color: 'white', fontSize: FontSize.sm, fontFamily: Fonts.bold },
});
