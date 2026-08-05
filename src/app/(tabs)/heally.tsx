import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, useColorScheme,
  ActivityIndicator, Alert, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { heallyService } from '@/services/heally.service';
import { useHeallyStore } from '@/store/heally-store';
import { Colors, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { ChatBubble } from '@/components/chat-bubble';
import { TypingIndicator } from '@/components/typing-indicator';
import { ChatMessage } from '@/types';

const SUGGESTIONS = [
  'Cek interaksi obat saya',
  'Buat jadwal olahraga',
  'Tips diet untuk kondisi saya',
  'Analisis rekam medis saya',
  'Gejala yang perlu diwaspadai',
];

export default function HeallyScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const queryClient = useQueryClient();
  const listRef = useRef<FlatList>(null);

  const {
    messages, isTyping, activeTab, input,
    setMessages, addMessage, updateMessageVerif,
    setTyping, setActiveTab, setInput,
  } = useHeallyStore();

  // Load message history
  const { isLoading } = useQuery({
    queryKey: ['heally-messages'],
    queryFn: async () => {
      const msgs = await heallyService.getMessages();
      setMessages(msgs);
      return msgs;
    },
    staleTime: 0,
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: heallyService.sendMessage,
    onMutate: ({ message }: any) => {
      // Optimistic: add user message immediately
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
      // Replace optimistic messages with real ones from server
      queryClient.invalidateQueries({ queryKey: ['heally-messages'] });
      // Add AI response
      addMessage(data.aiMessage);
      queryClient.invalidateQueries({ queryKey: ['verif'] });
    },
    onError: (err: any) => {
      setTyping(false);
      Alert.alert('Gagal', err.message ?? 'Gagal menghubungi Heally. Coba lagi.');
    },
  });

  // Request verif mutation
  const [verifLoadingId, setVerifLoadingId] = useState<number | null>(null);
  const verifMutation = useMutation({
    mutationFn: heallyService.requestVerif,
    onMutate: (messageId) => setVerifLoadingId(messageId),
    onSuccess: (data, messageId) => {
      updateMessageVerif(messageId, 'pending');
      setVerifLoadingId(null);
      queryClient.invalidateQueries({ queryKey: ['verif'] });
    },
    onError: (err: any) => {
      setVerifLoadingId(null);
      Alert.alert('Gagal', err.message);
    },
  });

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || sendMutation.isPending) return;
    sendMutation.mutate(msg as any);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 100);
  }, [messages.length, isTyping]);

  const allMessages: (ChatMessage | 'typing')[] = isTyping
    ? [...messages, 'typing']
    : messages;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.backgroundCard, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View style={styles.heallyInfo}>
            <View style={[styles.heallyAvatar, { backgroundColor: colors.primary }]}>
              <Text style={{ fontSize: 22 }}>🤖</Text>
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={[styles.heallyName, { color: colors.text }]}>Heally</Text>
              <Text style={[styles.heallyStatus, { color: colors.textMuted }]}>AI Kesehatan · Perlu verifikasi dokter</Text>
            </View>
          </View>
          <View style={[styles.aiBadge, { backgroundColor: colors.amberLight, borderColor: '#FDE68A' }]}>
            <View style={styles.aiBadgeDot} />
            <Text style={[styles.aiBadgeText, { color: colors.amber }]}>AI Unverified</Text>
          </View>
        </View>

        {/* Tab switcher */}
        <View style={[styles.tabSwitcher, { backgroundColor: colors.backgroundElement }]}>
          {[
            { id: 'chat', label: '💬 Chat' },
            { id: 'whatsapp', label: '📱 WhatsApp' },
          ].map(({ id, label }) => (
            <TouchableOpacity
              key={id}
              onPress={() => setActiveTab(id as 'chat' | 'whatsapp')}
              style={[
                styles.tabBtn,
                activeTab === id && { backgroundColor: colors.backgroundCard },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabBtnText,
                { color: activeTab === id ? colors.text : colors.textSecondary },
                activeTab === id && styles.tabBtnTextActive,
              ]}>
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
          keyboardVerticalOffset={0}
        >
          {/* Messages */}
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView
              ref={listRef as any}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: true })}
            >
              {messages.length === 0 && (
                <View style={[styles.welcomeCard, { backgroundColor: colors.primaryLight }]}>
                  <Text style={{ fontSize: 32 }}>👋</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.welcomeTitle, { color: colors.primary }]}>Halo! Saya Heally</Text>
                    <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                      Asisten kesehatan AI Anda. Saya dapat membantu memahami rekam medis, membuat jadwal, dan menjawab pertanyaan kesehatan Anda.
                    </Text>
                  </View>
                </View>
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

          {/* Suggestions */}
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

          {/* Input */}
          <View style={[styles.inputBar, { backgroundColor: colors.backgroundCard, borderTopColor: colors.border }]}>
            <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={input}
                onChangeText={setInput}
                placeholder="Tanya Heally tentang kesehatan Anda..."
                placeholderTextColor={colors.textMuted}
                multiline
                maxHeight={96}
                onSubmitEditing={handleSend}
              />
            </View>
            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || sendMutation.isPending}
              style={[
                styles.sendBtn,
                { backgroundColor: input.trim() ? colors.primary : colors.backgroundElement },
              ]}
              activeOpacity={0.8}
            >
              {sendMutation.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={{ fontSize: 18 }}>➤</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        // WhatsApp tab — UI only
        <ScrollView contentContainerStyle={styles.waContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.waConnected, { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }]}>
            <Text style={{ fontSize: 32 }}>📱</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.waTitle, { color: colors.text }]}>WhatsApp Terhubung</Text>
              <Text style={[styles.waPhone, { color: colors.textSecondary }]}>+62 812-3456-7890 · Aktif</Text>
            </View>
            <View style={styles.waOnlineDot} />
          </View>

          {[
            { icon: '💬', title: 'Kirim pesan ke Heally via WhatsApp', desc: 'Tanya pertanyaan kesehatan langsung dari WA Anda' },
            { icon: '🤖', title: 'Heally membalas otomatis', desc: 'Berdasarkan rekam medis & data kesehatan Anda' },
            { icon: '🩺', title: 'Verifikasi dokter bisa diminta', desc: 'Respons bertanda ⚠️ bisa dikirim ke dokter untuk diverifikasi' },
            { icon: '🔄', title: 'Riwayat tersinkronisasi', desc: 'Semua percakapan WA muncul di tab Chat secara otomatis' },
          ].map((item, i) => (
            <View key={i} style={styles.waFeature}>
              <View style={[styles.waFeatureIcon, { backgroundColor: colors.backgroundElement }]}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.waFeatureTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.waFeatureDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.waBtn, { backgroundColor: '#25D366' }]}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 22 }}>📲</Text>
            <Text style={styles.waBtnText}>Chat via WhatsApp</Text>
          </TouchableOpacity>

          <View style={styles.waNote}>
            <Text style={[styles.waNoteText, { color: colors.textMuted }]}>
              💡 Fitur WhatsApp akan segera tersedia. Stay tuned!
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  heallyInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heallyAvatar: { width: 44, height: 44, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  onlineDot: { position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ADE80', borderWidth: 2, borderColor: 'white' },
  heallyName: { fontSize: FontSize.lg, fontFamily: 'PlayfairDisplay_600SemiBold' },
  heallyStatus: { fontSize: FontSize.xs, fontFamily: 'Inter_400Regular' },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: 1 },
  aiBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F59E0B' },
  aiBadgeText: { fontSize: FontSize.xs, fontFamily: 'Inter_600SemiBold' },
  tabSwitcher: { flexDirection: 'row', margin: Spacing.sm, marginHorizontal: Spacing.lg, borderRadius: BorderRadius.full, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.full },
  tabBtnText: { fontSize: FontSize.xs, fontFamily: 'Inter_500Medium' },
  tabBtnTextActive: { fontFamily: 'Inter_700Bold' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messagesList: { padding: Spacing.base, gap: 0, paddingBottom: Spacing.lg },
  welcomeCard: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: BorderRadius.xl, marginBottom: 12, alignItems: 'flex-start' },
  welcomeTitle: { fontSize: FontSize.sm, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  welcomeText: { fontSize: FontSize.xs, lineHeight: 17, fontFamily: 'Inter_400Regular' },
  suggestions: { paddingHorizontal: Spacing.base, paddingVertical: 8, gap: 8 },
  suggestionChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1 },
  suggestionText: { fontSize: FontSize.xs, fontFamily: 'Inter_400Regular' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: Spacing.base, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, paddingBottom: 24 },
  inputWrapper: { flex: 1, borderRadius: BorderRadius.xl, paddingHorizontal: 14, paddingVertical: 10 },
  input: { fontSize: FontSize.sm, lineHeight: 20, maxHeight: 96, fontFamily: 'Inter_400Regular' },
  sendBtn: { width: 44, height: 44, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  // WhatsApp tab
  waContent: { padding: Spacing.lg, gap: Spacing.base, paddingBottom: 100 },
  waConnected: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.base, borderRadius: BorderRadius.xl, borderWidth: 1 },
  waTitle: { fontSize: FontSize.sm, fontFamily: 'Inter_700Bold' },
  waPhone: { fontSize: FontSize.xs, marginTop: 2, fontFamily: 'Inter_400Regular' },
  waOnlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#25D366' },
  waFeature: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  waFeatureIcon: { width: 40, height: 40, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  waFeatureTitle: { fontSize: FontSize.sm, fontFamily: 'Inter_600SemiBold' },
  waFeatureDesc: { fontSize: FontSize.xs, marginTop: 2, fontFamily: 'Inter_400Regular' },
  waBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: BorderRadius.full, shadowColor: '#25D366', shadowOpacity: 0.2, shadowRadius: 8, elevation: 2 },
  waBtnText: { color: 'white', fontFamily: 'Inter_700Bold', fontSize: FontSize.md },
  waNote: { alignItems: 'center' },
  waNoteText: { fontSize: FontSize.xs, textAlign: 'center', fontFamily: 'Inter_400Regular' },
});
