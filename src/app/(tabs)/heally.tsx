import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, useColorScheme,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { heallyService } from '@/services/heally.service';
import { scheduleService } from '@/services/schedule.service';
import { dailySyncService } from '@/services/daily-sync.service';
import { useHeallyStore } from '@/store/heally-store';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, nativeReset } from '@/constants/theme';
import { ChatBubble } from '@/components/chat-bubble';
import { ThinkingDraft } from '@/components/thinking-draft';
import { Icon } from '@/components/ui';
import { ChatMessage } from '@/types';
import { HeallyCtaAction, isScheduleIntentMessage, parseHeallyCtas } from '@/utils/heally-cta';
import { localDateKey } from '@/utils/local-date';

const DEFAULT_THINKING_STEPS = [
  'Memeriksa rekam medis & kondisi…',
  'Membaca screening PTM & catatan hari ini…',
  'Menilai jadwal obat hari ini…',
  'Menyusun jawaban personal…',
];

const SCHEDULE_THINKING_STEPS = [
  'Membaca screening risiko PTM…',
  'Membaca catatan harian…',
  'Menyusun jadwal makan & olahraga…',
  'Menyesuaikan dengan kondisi pasien…',
];

export default function HeallyScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const queryClient = useQueryClient();
  const listRef = useRef<ScrollView>(null);
  const resumeRunning = useRef(false);

  const {
    messages, isTyping, input, pendingScheduleWait,
    setMessages, addMessage, updateMessageVerif,
    setTyping, setInput, setPendingScheduleWait,
  } = useHeallyStore();

  const [thinkingSteps, setThinkingSteps] = useState<string[]>(DEFAULT_THINKING_STEPS);
  const [verifLoadingId, setVerifLoadingId] = useState<number | null>(null);
  const [ctaLoading, setCtaLoading] = useState<HeallyCtaAction['type'] | null>(null);

  const loadThinkingSteps = useCallback(async (context?: 'schedule' | 'resume' | 'default') => {
    try {
      const { steps } = await heallyService.getThinkingSteps(context);
      if (steps.length > 0) setThinkingSteps(steps);
    } catch {
      setThinkingSteps(
        context === 'schedule' || context === 'resume'
          ? SCHEDULE_THINKING_STEPS
          : DEFAULT_THINKING_STEPS
      );
    }
  }, []);

  const { error: messagesError, isLoading } = useQuery({
    queryKey: ['heally-messages'],
    queryFn: async () => {
      const msgs = await heallyService.getMessages();
      setMessages(msgs);
      return msgs;
    },
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const checkScheduleConfirm = async () => {
        if (resumeRunning.current || !pendingScheduleWait) return;
        resumeRunning.current = true;

        try {
          const result = await dailySyncService.sync(localDateKey(), { checkResume: true });
          if (cancelled) return;

          if (result.confirmPrompt?.sent) {
            const synced = await heallyService.getMessages();
            setMessages(synced);
            setPendingScheduleWait(false);
          }
        } catch {
          // best-effort on focus
        } finally {
          resumeRunning.current = false;
        }
      };

      checkScheduleConfirm();
      return () => {
        cancelled = true;
      };
    }, [pendingScheduleWait, setMessages, setPendingScheduleWait])
  );

  const sendMutation = useMutation({
    mutationFn: (message: string) => heallyService.sendMessage(message),
    onMutate: async (message: string) => {
      const context = isScheduleIntentMessage(message) ? 'schedule' : 'default';
      await loadThinkingSteps(context);
      const optimisticUserMsg: ChatMessage = {
        id: -Date.now(),
        userId: 0,
        role: 'user',
        content: message,
        needsVerif: false,
        safetyLevel: 'general',
        safetyReasons: [],
        verifStatus: null,
        verifDoctorName: null,
        verifNote: null,
        fromWhatsApp: false,
        createdAt: new Date().toISOString(),
      };
      addMessage(optimisticUserMsg);
      setInput('');
      setTyping(true);
    },
    onSuccess: async (data) => {
      setTyping(false);
      const synced = await heallyService.getMessages();
      setMessages(synced);

      const parsed = parseHeallyCtas(data.aiMessage.content);
      const waitingForPrereqs =
        parsed.actions.some((a) => a.type === 'open_screening' || a.type === 'open_daily_log') &&
        !parsed.actions.some((a) => a.type === 'generate_schedule');
      const scheduleDone = data.aiMessage.content.includes('Jadwal harian sudah dibuat');
      const confirmPrompt = data.aiMessage.content.includes('Apakah mau saya buatkan jadwal');
      if (waitingForPrereqs) setPendingScheduleWait(true);
      if (confirmPrompt) setPendingScheduleWait(false);
      if (scheduleDone) setPendingScheduleWait(false);

      queryClient.invalidateQueries({ queryKey: ['verif'] });
      if (isScheduleIntentMessage(data.userMessage.content)) {
        queryClient.invalidateQueries({ queryKey: ['schedules'] });
      }
      if (data.verifRequest) {
        updateMessageVerif(data.aiMessage.id, 'pending');
      }
    },
    onError: (err: any) => {
      setTyping(false);
      Alert.alert('Gagal', err.message ?? 'Gagal menghubungi Heally. Coba lagi.');
      heallyService.getMessages().then(setMessages).catch(() => null);
    },
  });

  const handleHeallyAction = async (action: HeallyCtaAction) => {
    setCtaLoading(action.type);
    try {
      if (action.type === 'generate_schedule') {
        setTyping(true);
        await loadThinkingSteps('schedule');
        const { warnings } = await scheduleService.aiGenerate(localDateKey());
        setPendingScheduleWait(false);
        queryClient.invalidateQueries({ queryKey: ['schedules'] });
        const synced = await heallyService.getMessages();
        setMessages(synced);
        Alert.alert(
          'Jadwal dibuat',
          warnings.length > 0 ? warnings.join('\n') : 'Jadwal AI hari ini sudah ditambahkan. Buka tab Jadwal untuk melihat.'
        );
      } else if (action.type === 'open_screening') {
        router.push('/(tabs)/screening');
      } else if (action.type === 'open_daily_log') {
        router.push('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Gagal', err.message ?? 'Aksi tidak dapat dijalankan');
    } finally {
      setCtaLoading(null);
      setTyping(false);
    }
  };

  const verifMutation = useMutation({
    mutationFn: heallyService.requestVerif,
    onMutate: (messageId) => setVerifLoadingId(messageId),
    onSuccess: (_data, messageId) => {
      updateMessageVerif(messageId, 'pending');
      setVerifLoadingId(null);
      queryClient.invalidateQueries({ queryKey: ['verif'] });
    },
    onError: (err: any) => {
      setVerifLoadingId(null);
      Alert.alert('Gagal', err.message ?? 'Tidak bisa mengirim permintaan verifikasi.');
    },
  });

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || sendMutation.isPending || isTyping) return;
    sendMutation.mutate(msg);
  };

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 100);
  }, [messages.length, isTyping]);

  const welcomeMessage: ChatMessage = {
    id: -1,
    userId: 0,
    role: 'assistant',
    content: 'Halo! Saya **Heally**, asisten kesehatan AI Anda. Silakan ketik pertanyaan tentang kondisi, obat, atau rekam medis Anda.',
    needsVerif: false,
    safetyLevel: 'general',
    safetyReasons: [],
    verifStatus: null,
    verifDoctorName: null,
    verifNote: null,
    fromWhatsApp: false,
    createdAt: new Date().toISOString(),
  };

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
                Terhubung ke Server
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

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
              <ChatBubble message={welcomeMessage} />
            )}

            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                onRequestVerif={(message) => verifMutation.mutate(message.id)}
                isVerifLoading={verifLoadingId === msg.id}
                onHeallyAction={handleHeallyAction}
                heallyActionLoading={ctaLoading}
              />
            ))}

            {isTyping && <ThinkingDraft steps={thinkingSteps} />}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadError: { padding: Spacing.xl, textAlign: 'center', fontSize: FontSize.sm, fontFamily: Fonts.medium },
  messagesList: { padding: Spacing.base, paddingBottom: Spacing.lg },
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
});
