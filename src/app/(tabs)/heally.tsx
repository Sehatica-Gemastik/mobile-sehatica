import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, useColorScheme,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { heallyService } from '@/services/heally.service';
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
  const queryClient = useQueryClient();
  const listRef = useRef<ScrollView>(null);

  const {
    messages, isTyping, activeTab, input,
    setMessages, addMessage, updateMessageVerif,
    setTyping, setActiveTab, setInput,
  } = useHeallyStore();

  const { isLoading } = useQuery({
    queryKey: ['heally-messages'],
    queryFn: async () => {
      const msgs = await heallyService.getMessages();
      setMessages(msgs);
      return msgs;
    },
    staleTime: 0,
  });

  const sendMutation = useMutation({
    mutationFn: heallyService.sendMessage,
    onMutate: ({ message }: any) => {
      const optimisticUserMsg: ChatMessage = {
        id: Date.now(),
        userId: 0,
        role: 'user',
        content: message,
        needsVerif: false,
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
    onSuccess: (data) => {
      setTyping(false);
      queryClient.invalidateQueries({ queryKey: ['heally-messages'] });
      addMessage(data.aiMessage);
      queryClient.invalidateQueries({ queryKey: ['verif'] });
    },
    onError: (err: any) => {
      setTyping(false);
      Alert.alert('Gagal', err.message ?? 'Gagal menghubungi Heally. Coba lagi.');
    },
  });

  const [verifLoadingId, setVerifLoadingId] = useState<number | null>(null);
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
      Alert.alert('Gagal', err.message);
    },
  });

  const handleSend = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sendMutation.isPending) return;
    sendMutation.mutate(msg as any);
  };

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 100);
  }, [messages.length, isTyping]);

  const welcomeMessage: ChatMessage = {
    id: -1,
    userId: 0,
    role: 'assistant',
    content: 'Halo! Saya Heally. Asisten kesehatan AI Anda — silakan pilih topik di bawah atau ketik pertanyaan.',
    needsVerif: false,
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
                AI kesehatan · Perlu verifikasi dokter
              </Text>
            </View>
          </View>
          <View style={[styles.aiBadge, { backgroundColor: colors.amberLight, borderColor: '#FDE68A' }]}>
            <View style={styles.aiBadgeDot} />
            <Text style={[styles.aiBadgeText, { color: colors.amber }]}>AI Unverified</Text>
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
          ) : (
            <ScrollView
              ref={listRef}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: true })}
            >
              {messages.length === 0 && (
                <>
                  <ChatBubble message={welcomeMessage} />
                  {SUGGESTIONS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => handleSend(s)}
                      disabled={sendMutation.isPending}
                      activeOpacity={0.75}
                      style={styles.templateRow}
                    >
                      <View
                        style={[
                          styles.templateBubble,
                          { backgroundColor: colors.backgroundCard, borderColor: colors.border },
                        ]}
                      >
                        <Text style={[styles.templateText, { color: colors.text }]}>{s}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  onRequestVerif={(id) => verifMutation.mutate(id)}
                  isVerifLoading={verifLoadingId === msg.id}
                />
              ))}

              {isTyping && <TypingIndicator />}
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
                onSubmitEditing={() => handleSend()}
                underlineColorAndroid="transparent"
                selectionColor={colors.primary}
              />
            </View>
            <TouchableOpacity
              onPress={() => handleSend()}
              disabled={!input.trim() || sendMutation.isPending}
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
              <Text style={[styles.waTitle, { color: colors.text }]}>WhatsApp terhubung</Text>
              <Text style={[styles.waPhone, { color: colors.textSecondary }]}>+62 812-3456-7890 · Aktif</Text>
            </View>
            <View style={styles.waOnlineDot} />
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

          <TouchableOpacity style={[styles.waBtn, { backgroundColor: colors.whatsapp }]} activeOpacity={0.8}>
            <Icon name="logo-whatsapp" size="md" color="#FFFFFF" />
            <Text style={styles.waBtnText}>Chat via WhatsApp</Text>
          </TouchableOpacity>

          <View style={styles.waNote}>
            <Text style={[styles.waNoteText, { color: colors.textMuted }]}>
              Fitur WhatsApp akan segera tersedia
            </Text>
          </View>
        </ScrollView>
      )}
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
  messagesList: { padding: Spacing.base, paddingBottom: Spacing.lg },
  templateRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
    paddingLeft: 36,
  },
  templateBubble: {
    maxWidth: '82%',
    borderRadius: BorderRadius.lg,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  templateText: { fontSize: FontSize.sm, lineHeight: 20, fontFamily: Fonts.regular },
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
  waOnlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#25D366' },
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
});
