import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, useColorScheme,
  ActivityIndicator, Alert, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { heallyService } from '@/services/heally.service';
import { doctorService } from '@/services/doctor.service';
import { reviewService } from '@/services/review.service';
import { useHeallyStore } from '@/store/heally-store';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, nativeReset } from '@/constants/theme';
import { ChatBubble } from '@/components/chat-bubble';
import { ThinkingDraft } from '@/components/thinking-draft';
import { Icon, IconName } from '@/components/ui';
import { ChatMessage, Doctor, DoctorPermissionRequest, ReviewScope, ReviewType } from '@/types';

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

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

export default function HeallyScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const listRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();

  const [reviewWizardOpen, setReviewWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [patientNote, setPatientNote] = useState('');
  const [reviewScope, setReviewScope] = useState<ReviewScope>('bubble');
  const [reviewType, setReviewType] = useState<ReviewType>('paid');
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [selectedAiIds, setSelectedAiIds] = useState<number[]>([]);

  const {
    messages, sessions, activeSessionId, isTyping, activeTab, input,
    setMessages, addMessage, setSessions, setActiveSessionId,
    setTyping, setActiveTab, setInput,
  } = useHeallyStore();

  // Load Sessions
  const { data: fetchedSessions = [] } = useQuery({
    queryKey: ['heally-sessions'],
    queryFn: async () => {
      let list = await heallyService.getSessions();
      if (list.length === 0) {
        const def = await heallyService.getDefaultSession();
        list = [def];
      }
      setSessions(list);
      if (!activeSessionId) setActiveSessionId(list[0].id);
      return list;
    },
  });

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? fetchedSessions[0] ?? null;

  // Load Messages for active session
  const { error: messagesError, isLoading } = useQuery({
    queryKey: ['heally-messages', activeSessionId],
    queryFn: async () => {
      const msgs = await heallyService.getMessages(activeSessionId ?? undefined);
      setMessages(msgs);
      return msgs;
    },
    enabled: Boolean(activeSessionId),
  });

  // Load Doctors
  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorService.getAll,
  });

  // Filter Doctors by search query
  const filteredDoctors = doctors.filter((doctor) => {
    if (!doctorSearchQuery.trim()) return true;
    const query = doctorSearchQuery.toLowerCase();
    return doctor.name.toLowerCase().includes(query) || doctor.specialty.toLowerCase().includes(query);
  });

  const selectedDoctor: Doctor | null = doctors.find((d) => d.id === selectedDoctorId) ?? filteredDoctors[0] ?? null;

  // Load Doctor Permission Requests (pending user consent for voluntary reviews claimed by doctor)
  const { data: permissionRequests = [] } = useQuery({
    queryKey: ['doctor-permission-requests'],
    queryFn: reviewService.getDoctorPermissionRequests,
    retry: 1,
  });

  useQuery({
    queryKey: ['reviews', 'mine'],
    queryFn: async () => {
      const synced = await reviewService.syncMine();
      setMessages(synced);
      return synced.length;
    },
    retry: 1,
  });

  // Extract all AI messages for checklist selection
  const assistantMessages = messages.filter((m) => m.role === 'assistant');

  // Calculate Selected QnA Pairs (AI bubble + preceding user question bubble)
  const qnaItems: Array<{ clientMessageId: number; patientQuestion: string; aiResponse: string; safetyLevel: string }> = [];
  const activeAiIds = reviewScope === 'bubble'
    ? selectedAiIds
    : assistantMessages.map((m) => m.id);

  for (const aiId of activeAiIds) {
    const aiIndex = messages.findIndex((m) => m.id === aiId);
    if (aiIndex !== -1) {
      const aiMsg = messages[aiIndex];
      let userQuestion = 'Review Konsultasi Heally';
      for (let j = aiIndex - 1; j >= 0; j--) {
        if (messages[j].role === 'user') {
          userQuestion = messages[j].content;
          break;
        }
      }
      qnaItems.push({
        clientMessageId: aiMsg.id,
        patientQuestion: userQuestion,
        aiResponse: aiMsg.content,
        safetyLevel: aiMsg.safetyLevel || 'general',
      });
    }
  }

  const qnaCount = Math.max(1, qnaItems.length);
  const feePerQna = selectedDoctor ? parseFloat(selectedDoctor.feePerQna || '25000') : 25000;
  const totalPrice = qnaCount * feePerQna;

  const toggleAiSelection = (msgId: number) => {
    if (selectedAiIds.includes(msgId)) {
      setSelectedAiIds(selectedAiIds.filter((id) => id !== msgId));
    } else {
      setSelectedAiIds([...selectedAiIds, msgId]);
    }
  };

  const openReviewWizard = (initialAiMsg?: ChatMessage) => {
    setWizardStep(1);
    setReviewScope('bubble');
    if (initialAiMsg) {
      setSelectedAiIds([initialAiMsg.id]);
    } else if (assistantMessages.length > 0) {
      setSelectedAiIds([assistantMessages[assistantMessages.length - 1].id]);
    }
    setReviewWizardOpen(true);
  };

  // Mutations
  const grantPermissionMutation = useMutation({
    mutationFn: ({ reviewId, action }: { reviewId: number; action: 'grant' | 'decline' }) =>
      reviewService.grantDoctorPermission(reviewId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-permission-requests'] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'mine'] });
      Alert.alert('Sukses', 'Respon persetujuan Anda telah tersimpan.');
    },
    onError: (err: Error) => Alert.alert('Gagal', err.message),
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (reviewType === 'paid' && !selectedDoctor) throw new Error('Pilih dokter partner');

      await reviewService.submitMultiChat({
        doctorId: reviewType === 'paid' ? selectedDoctor?.id : undefined,
        reviewScope,
        reviewType,
        isPaid: reviewType === 'paid',
        fee: reviewType === 'paid' ? totalPrice.toString() : '0',
        patientNote,
        sessionId: activeSessionId ?? undefined,
        items: qnaItems,
      });

      if (activeAiIds[0]) {
        return reviewService.markPending(activeAiIds[0], reviewType === 'paid' ? selectedDoctor!.name : 'Dokter Sukarela');
      }
      return heallyService.getMessages(activeSessionId ?? undefined);
    },
    onSuccess: (synced) => {
      setMessages(synced);
      setReviewWizardOpen(false);
      setSelectedDoctorId(null);
      setPatientNote('');
      setSelectedAiIds([]);
      Alert.alert(
        reviewType === 'paid' ? 'Pembayaran Berhasil' : 'Review Sukarela Dikirim',
        reviewType === 'paid'
          ? `Pembayaran ${formatRupiah(totalPrice)} berhasil. ${selectedDoctor?.name} akan segera meninjau percakapan Anda.`
          : 'Request sukarela telah dikirim ke Pool Dokter. Anda akan menerima notifikasi izin saat dokter siap meninjau.'
      );
    },
    onError: (error: Error) => Alert.alert('Review gagal dikirim', error.message),
  });

  const sendMutation = useMutation({
    mutationFn: heallyService.replyTo,
    onSuccess: (aiMessage) => {
      setTyping(false);
      addMessage(aiMessage);
    },
    onError: (err: any) => {
      setTyping(false);
      Alert.alert('Pesan tersimpan', err.message ?? 'Heally membutuhkan internet untuk menjawab.');
    },
  });

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sendMutation.isPending || isTyping) return;
    setInput('');
    setTyping(true);
    try {
      const userMessage = await heallyService.saveUserMessage(msg, undefined, activeSessionId ?? undefined);
      addMessage(userMessage);
      sendMutation.mutate(userMessage);
    } catch (error) {
      setTyping(false);
      Alert.alert('Gagal', error instanceof Error ? error.message : 'Pesan tidak dapat disimpan');
    }
  };

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
              <Text style={[styles.heallyName, { color: colors.text }]}>Heally AI</Text>
              <TouchableOpacity
                onPress={() => setRoomModalOpen(true)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Text style={[styles.heallyStatus, { color: colors.primary, fontFamily: Fonts.bold }]}>
                  {activeSession?.title ?? 'Chat Room'} ▾
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => openReviewWizard()}
              style={[styles.roomBtn, { backgroundColor: colors.primary }]}
            >
              <Icon name="shield-checkmark-outline" size="sm" color="white" />
              <Text style={[styles.roomBtnText, { color: 'white' }]}>Minta Review</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabSwitcher, { backgroundColor: colors.backgroundElement }]}>
          {[
            { id: 'chat' as const, label: 'Chat Room', icon: 'chatbubble-outline' as IconName },
            { id: 'whatsapp' as const, label: 'WhatsApp Sync', icon: 'logo-whatsapp' as IconName },
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
              <Icon name={icon} size="sm" color={activeTab === id ? colors.text : colors.textSecondary} />
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

      {/* Permission Requests Banner Notice */}
      {permissionRequests.length > 0 ? (
        <View style={[styles.voluntaryBanner, { backgroundColor: colors.primaryLight, borderColor: colors.primaryMuted }]}>
          <Icon name="medical-outline" size="md" color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.voluntaryTitle, { color: colors.primaryDark }]}>
              {permissionRequests[0].doctorName} ({permissionRequests[0].specialty})
            </Text>
            <Text style={[styles.voluntarySub, { color: colors.textSecondary }]}>
              Bersedia meninjau percakapan ({permissionRequests[0].qnaCount} QnA). Berikan izin akses?
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              onPress={() => grantPermissionMutation.mutate({ reviewId: permissionRequests[0].id, action: 'decline' })}
              style={[styles.bannerBtn, { backgroundColor: colors.redLight }]}
            >
              <Text style={{ fontSize: FontSize.xs, color: colors.red, fontFamily: Fonts.bold }}>Tolak</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => grantPermissionMutation.mutate({ reviewId: permissionRequests[0].id, action: 'grant' })}
              style={[styles.bannerBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={{ fontSize: FontSize.xs, color: 'white', fontFamily: Fonts.bold }}>Beri Izin</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

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
                  <Icon name="sparkles-outline" size="lg" color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.welcomeTitle, { color: colors.primary }]}>Room: {activeSession?.title}</Text>
                    <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                      Tanyakan gejala, keluhan kesehatan, atau rekam medis pada Heally AI.
                    </Text>
                  </View>
                </View>
              )}

              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  onRequestVerif={() => openReviewWizard(msg)}
                  isVerifLoading={submitReviewMutation.isPending}
                />
              ))}

              {isTyping && <ThinkingDraft />}
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
                placeholder="Tanya Heally AI..."
                placeholderTextColor={colors.textMuted}
                multiline
                onSubmitEditing={() => handleSend()}
                underlineColorAndroid="transparent"
                selectionColor={colors.primary}
              />
            </View>
            <TouchableOpacity
              onPress={() => handleSend()}
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
        </ScrollView>
      )}

      {/* Intuitive 2-Step Review Wizard Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={reviewWizardOpen}
        onRequestClose={() => setReviewWizardOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setReviewWizardOpen(false)} />
          <View style={[styles.reviewCard, { backgroundColor: colors.backgroundCard }]}>
            <View style={styles.reviewHeader}>
              <View style={[styles.reviewIcon, { backgroundColor: colors.primaryLight }]}>
                <Icon name="shield-checkmark-outline" size="md" color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.reviewTitle, { color: colors.text }]}>
                  {wizardStep === 1 ? 'Langkah 1: Pilih QnA & Scope Review' : 'Langkah 2: Pilih Dokter & Pembayaran'}
                </Text>
                <Text style={[styles.reviewSubtitle, { color: colors.textSecondary }]}>
                  {qnaCount} Pasang QnA Terpilih (Pertanyaan + AI Answer)
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReviewWizardOpen(false)}>
                <Icon name="close" size="md" color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {wizardStep === 1 ? (
              <>
                {/* Scope Selection Tabs */}
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Cakupan Izin Review (Scope)</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {[
                    { id: 'bubble' as const, label: 'QnA Tertentu' },
                    { id: 'session' as const, label: 'Sesi Room Ini' },
                    { id: 'history' as const, label: 'Seluruh Riwayat' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => setReviewScope(item.id)}
                      style={[
                        styles.scopeTabBtn,
                        { borderColor: reviewScope === item.id ? colors.primary : colors.border },
                        reviewScope === item.id && { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <Text style={{ fontSize: FontSize.xs, fontFamily: Fonts.bold, color: reviewScope === item.id ? colors.primary : colors.textSecondary }}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* QnA Pair Checklist (For Bubble Scope) */}
                {reviewScope === 'bubble' ? (
                  <>
                    <Text style={[styles.reviewLabel, { color: colors.textSecondary, marginTop: 4 }]}>
                      Centang QnA yang Ingin Ditinjau Dokter ({selectedAiIds.length} Terpilih)
                    </Text>
                    <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                      {assistantMessages.length === 0 ? (
                        <Text style={{ textAlign: 'center', color: colors.textMuted, padding: 12 }}>Belum ada percakapan Heally di room ini.</Text>
                      ) : (
                        assistantMessages.map((aiMsg, idx) => {
                          const isChecked = selectedAiIds.includes(aiMsg.id);
                          // Find question
                          const aiIndex = messages.findIndex((m) => m.id === aiMsg.id);
                          let qText = 'Pertanyaan Pasien';
                          for (let j = aiIndex - 1; j >= 0; j--) {
                            if (messages[j].role === 'user') {
                              qText = messages[j].content;
                              break;
                            }
                          }
                          return (
                            <TouchableOpacity
                              key={aiMsg.id}
                              onPress={() => toggleAiSelection(aiMsg.id)}
                              style={{
                                flexDirection: 'row', alignItems: 'flex-start', gap: 10,
                                borderWidth: 1, borderColor: isChecked ? colors.primary : colors.border,
                                backgroundColor: isChecked ? colors.primaryLight : colors.backgroundElement,
                                borderRadius: 8, padding: 10, marginBottom: 6,
                              }}
                            >
                              <Icon name={isChecked ? 'checkbox' : 'square-outline'} size="md" color={isChecked ? colors.primary : colors.textMuted} />
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: FontSize.xs, fontFamily: Fonts.bold, color: colors.text }} numberOfLines={1}>
                                  QnA #{idx + 1}: {qText}
                                </Text>
                                <Text style={{ fontSize: FontSize.xs, fontFamily: Fonts.regular, color: colors.textSecondary, marginTop: 2 }} numberOfLines={2}>
                                  Jawaban: {aiMsg.content}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </ScrollView>
                  </>
                ) : (
                  <View style={{ backgroundColor: colors.primaryLight, padding: 12, borderRadius: 8, marginVertical: 6 }}>
                    <Text style={{ fontSize: FontSize.xs, color: colors.primaryDark, fontFamily: Fonts.medium }}>
                      {reviewScope === 'session'
                        ? `Menyertakan seluruh ${qnaCount} pasang QnA pada sesi room "${activeSession?.title}".`
                        : `Menyertakan seluruh ${qnaCount} pasang QnA riwayat konsultasi Anda.`}
                    </Text>
                  </View>
                )}

                <View style={styles.reviewActions}>
                  <TouchableOpacity style={[styles.reviewCancel, { borderColor: colors.border }]} onPress={() => setReviewWizardOpen(false)}>
                    <Text style={[styles.reviewCancelText, { color: colors.textSecondary }]}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setWizardStep(2)}
                    style={[styles.reviewSubmit, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.reviewSubmitText}>Lanjut ke Pilih Dokter →</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* Step 2: Choose Review Type & Doctor */}
                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Jenis Review</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setReviewType('paid')}
                    style={[
                      styles.scopeTabBtn,
                      { borderColor: reviewType === 'paid' ? colors.primary : colors.border },
                      reviewType === 'paid' && { backgroundColor: colors.primaryLight },
                    ]}
                  >
                    <Text style={{ fontSize: FontSize.xs, fontFamily: Fonts.bold, color: reviewType === 'paid' ? colors.primary : colors.textSecondary }}>
                      Review Berbayar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setReviewType('voluntary')}
                    style={[
                      styles.scopeTabBtn,
                      { borderColor: reviewType === 'voluntary' ? colors.primary : colors.border },
                      reviewType === 'voluntary' && { backgroundColor: colors.primaryLight },
                    ]}
                  >
                    <Text style={{ fontSize: FontSize.xs, fontFamily: Fonts.bold, color: reviewType === 'voluntary' ? colors.primary : colors.textSecondary }}>
                      Review Sukarela
                    </Text>
                  </TouchableOpacity>
                </View>

                {reviewType === 'paid' ? (
                  <>
                    <Text style={[styles.reviewLabel, { color: colors.textSecondary, marginTop: 4 }]}>Pilih Dokter Partner</Text>
                    <TextInput
                      value={doctorSearchQuery}
                      onChangeText={setDoctorSearchQuery}
                      placeholder="Cari dokter berdasarkan nama atau spesialisasi..."
                      placeholderTextColor={colors.textMuted}
                      style={[styles.input, { height: 40, backgroundColor: colors.backgroundElement, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 10, fontSize: 13 }]}
                    />

                    {doctorsLoading ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : filteredDoctors.length === 0 ? (
                      <Text style={[styles.reviewEmpty, { color: colors.textMuted }]}>Dokter tidak ditemukan.</Text>
                    ) : (
                      <ScrollView style={styles.doctorPicker} showsVerticalScrollIndicator={false}>
                        {filteredDoctors.map((doctor) => {
                          const selected = selectedDoctor?.id === doctor.id;
                          const unitFee = parseFloat(doctor.feePerQna || '25000');
                          return (
                            <TouchableOpacity
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
                                <Text style={[styles.doctorOptionMeta, { color: colors.textSecondary }]}>
                                  {doctor.specialty} · {formatRupiah(unitFee)} / QnA
                                </Text>
                              </View>
                              <Icon name={selected ? 'radio-button-on' : 'radio-button-off'} size="md" color={selected ? colors.primary : colors.textMuted} />
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    )}

                    {/* Calculated Total Price Banner */}
                    <View style={{ backgroundColor: colors.primaryLight, padding: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: FontSize.xs, color: colors.primaryDark, fontFamily: Fonts.bold }}>Total Bayar ({qnaCount} QnA × {formatRupiah(feePerQna)})</Text>
                      <Text style={{ fontSize: FontSize.md, color: colors.primary, fontFamily: Fonts.bold }}>{formatRupiah(totalPrice)}</Text>
                    </View>
                  </>
                ) : (
                  <View style={{ backgroundColor: '#FEF3C7', padding: 10, borderRadius: 8, marginTop: 4 }}>
                    <Text style={{ fontSize: FontSize.xs, color: '#D97706', fontFamily: Fonts.regular }}>
                      Request akan masuk ke Pool Dokter Sukarela tanpa isi percakapan. Dokter yang mengklaim akan meminta izin sebelum melihat pesan.
                    </Text>
                  </View>
                )}

                <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Catatan Tambahan (Opsional)</Text>
                <TextInput
                  value={patientNote}
                  onChangeText={setPatientNote}
                  maxLength={1000}
                  multiline
                  placeholder="Contoh: Tolong pastikan rekomendasi obat ini aman untuk saya..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.reviewNote, { color: colors.text, borderColor: colors.border }]}
                />

                <View style={styles.reviewActions}>
                  <TouchableOpacity style={[styles.reviewCancel, { borderColor: colors.border }]} onPress={() => setWizardStep(1)}>
                    <Text style={[styles.reviewCancelText, { color: colors.textSecondary }]}>← Kembali</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={submitReviewMutation.isPending || (reviewType === 'paid' && !selectedDoctor)}
                    onPress={() => submitReviewMutation.mutate()}
                    style={[styles.reviewSubmit, { backgroundColor: colors.primary, opacity: (reviewType === 'paid' && !selectedDoctor) ? 0.45 : 1 }]}
                  >
                    {submitReviewMutation.isPending ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.reviewSubmitText}>
                        {reviewType === 'paid' ? `Bayar ${formatRupiah(totalPrice)} & Kirim` : 'Kirim ke Pool Sukarela'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Room Sessions Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={roomModalOpen}
        onRequestClose={() => setRoomModalOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setRoomModalOpen(false)} />
          <View style={[styles.reviewCard, { backgroundColor: colors.backgroundCard }]}>
            <View style={styles.reviewHeader}>
              <View style={[styles.reviewIcon, { backgroundColor: colors.primaryLight }]}>
                <Icon name="chatbubbles-outline" size="md" color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.reviewTitle, { color: colors.text }]}>Chat Room Sessions</Text>
                <Text style={[styles.reviewSubtitle, { color: colors.textSecondary }]}>Pilih atau buat topik percakapan baru</Text>
              </View>
              <TouchableOpacity onPress={() => setRoomModalOpen(false)}>
                <Icon name="close" size="md" color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
              <TextInput
                value={newRoomTitle}
                onChangeText={setNewRoomTitle}
                placeholder="Nama room baru (misal: Demam & Batuk)..."
                placeholderTextColor={colors.textMuted}
                style={[styles.reviewNote, { flex: 1, minHeight: 44, paddingVertical: 8 }]}
              />
              <TouchableOpacity
                onPress={() => {
                  if (newRoomTitle.trim()) {
                    heallyService.createSession(newRoomTitle.trim()).then((sess) => {
                      setSessions([sess, ...sessions]);
                      setActiveSessionId(sess.id);
                      setMessages([]);
                      setRoomModalOpen(false);
                      setNewRoomTitle('');
                    });
                  }
                }}
                style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' }}
              >
                <Text style={{ color: 'white', fontFamily: Fonts.bold }}>+ Buat</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 220 }}>
              {sessions.map((sess) => {
                const isSelected = sess.id === activeSessionId;
                return (
                  <TouchableOpacity
                    key={sess.id}
                    onPress={() => {
                      setActiveSessionId(sess.id);
                      setRoomModalOpen(false);
                    }}
                    style={[
                      styles.doctorOption,
                      { borderColor: isSelected ? colors.primary : colors.border },
                      isSelected && { backgroundColor: colors.primaryLight },
                    ]}
                  >
                    <Icon name="chatbubble-ellipses-outline" size="sm" color={isSelected ? colors.primary : colors.textMuted} />
                    <Text style={[styles.doctorOptionName, { color: colors.text, flex: 1 }]}>{sess.title}</Text>
                    {isSelected ? <Icon name="checkmark" size="sm" color={colors.primary} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
  roomBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.full,
  },
  roomBtnText: { fontSize: FontSize.xs, fontFamily: Fonts.bold },
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
  voluntaryBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: Spacing.lg, marginTop: Spacing.sm, padding: Spacing.md,
    borderRadius: BorderRadius.md, borderWidth: 1,
  },
  voluntaryTitle: { fontSize: FontSize.xs, fontFamily: Fonts.bold },
  voluntarySub: { fontSize: FontSize.xs, fontFamily: Fonts.regular, marginTop: 2 },
  bannerBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.sm },
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
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 35, 31, 0.48)' },
  reviewCard: {
    maxHeight: '94%', padding: Spacing.lg, paddingBottom: 28,
    borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, gap: 10,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewIcon: { width: 40, height: 40, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  reviewTitle: { fontSize: FontSize.md, fontFamily: Fonts.bold },
  reviewSubtitle: { fontSize: FontSize.xs, fontFamily: Fonts.regular, marginTop: 2 },
  reviewLabel: { fontSize: FontSize.xs, fontFamily: Fonts.bold },
  scopeTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm, borderWidth: 1 },
  reviewEmpty: { fontSize: FontSize.sm, fontFamily: Fonts.regular, textAlign: 'center', padding: 16 },
  doctorPicker: { maxHeight: 140 },
  doctorOption: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: BorderRadius.md, padding: 10, marginBottom: 8 },
  doctorAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  doctorAvatarText: { fontSize: FontSize.xs, fontFamily: Fonts.bold },
  doctorOptionName: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  doctorOptionMeta: { fontSize: FontSize.xs, fontFamily: Fonts.regular, marginTop: 2 },
  reviewNote: { minHeight: 56, borderWidth: 1, borderRadius: BorderRadius.md, padding: 10, textAlignVertical: 'top', fontSize: FontSize.sm, fontFamily: Fonts.regular },
  reviewActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  reviewCancel: { borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: 18, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  reviewCancelText: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  reviewSubmit: { flex: 1, borderRadius: BorderRadius.md, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  reviewSubmitText: { color: 'white', fontSize: FontSize.sm, fontFamily: Fonts.bold },
});
