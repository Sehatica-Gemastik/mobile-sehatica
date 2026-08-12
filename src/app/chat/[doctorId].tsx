import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService, ChatMessage } from '@/services/chat.service';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@/constants/theme';
import { AppScreen } from '@/components/screen-background';
import { useScreenTopPadding } from '@/hooks/use-screen-top-padding';
import { Icon, InitialsAvatar, surfaceHeaderShell } from '@/components/ui';

export default function ChatScreen() {
  const { doctorId: doctorIdParam } = useLocalSearchParams<{ doctorId: string }>();
  const doctorId = parseInt(doctorIdParam ?? '', 10);
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const topPadding = useScreenTopPadding();
  const queryClient = useQueryClient();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [draft, setDraft] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['chat', doctorId],
    queryFn: () => chatService.getThread(doctorId),
    enabled: Number.isFinite(doctorId),
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => chatService.sendMessage(doctorId, content),
    onSuccess: (message) => {
      queryClient.setQueryData(['chat', doctorId], (prev: typeof data) => {
        if (!prev) return prev;
        return { ...prev, messages: [...prev.messages, message] };
      });
      setDraft('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    },
  });

  const doctor = data?.doctor;
  const canSend = Boolean(doctor?.isAvailable) && draft.trim().length > 0 && !sendMutation.isPending;

  if (!Number.isFinite(doctorId)) {
    return (
      <AppScreen style={styles.container}>
        <View style={styles.center}>
          <Text style={{ color: colors.text }}>Dokter tidak valid</Text>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <View
          style={[
            styles.header,
            surfaceHeaderShell(colors),
            { paddingTop: topPadding, backgroundColor: colors.backgroundCard },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Icon name="arrow-back" size="md" color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            {doctor ? (
              <>
                <InitialsAvatar initials={doctor.avatarInitials} name={doctor.name} size="sm" />
                <View style={styles.headerText}>
                  <Text style={[styles.doctorName, { color: colors.text }]} numberOfLines={1}>
                    {doctor.name}
                  </Text>
                  <Text style={[styles.doctorMeta, { color: colors.textMuted }]} numberOfLines={1}>
                    {doctor.specialty} · {doctor.isAvailable ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={[styles.doctorName, { color: colors.text }]}>Chat dokter</Text>
            )}
          </View>
          <View style={styles.backBtn} />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>
              {error instanceof Error ? error.message : 'Gagal memuat chat'}
            </Text>
          </View>
        ) : (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
          >
            <FlatList
              ref={listRef}
              data={data?.messages ?? []}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.messages}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    Belum ada pesan. Mulai percakapan dengan dokter partner Anda.
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const isUser = item.role === 'user';
                return (
                  <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowDoctor]}>
                    <View
                      style={[
                        styles.bubble,
                        isUser
                          ? { backgroundColor: colors.primary }
                          : { backgroundColor: colors.backgroundCard, borderColor: colors.border, borderWidth: 1 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.bubbleText,
                          { color: isUser ? colors.onPrimary : colors.text },
                        ]}
                      >
                        {item.content}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />

            <View style={[styles.composer, { borderTopColor: colors.borderLight, backgroundColor: colors.backgroundCard }]}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={doctor?.isAvailable ? 'Tulis pesan...' : 'Dokter sedang offline'}
                placeholderTextColor={colors.textMuted}
                editable={Boolean(doctor?.isAvailable) && !sendMutation.isPending}
                multiline
                style={[styles.input, { color: colors.text }]}
              />
              <TouchableOpacity
                onPress={() => sendMutation.mutate(draft.trim())}
                disabled={!canSend}
                style={[
                  styles.sendBtn,
                  { backgroundColor: canSend ? colors.primary : colors.backgroundElement },
                ]}
                activeOpacity={0.8}
              >
                {sendMutation.isPending
                  ? <ActivityIndicator size="small" color={colors.onPrimary} />
                  : <Icon name="send-outline" size="sm" color={canSend ? colors.onPrimary : colors.textMuted} />}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerText: { flex: 1, gap: 2 },
  doctorName: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  doctorMeta: { fontSize: FontSize.xs, fontFamily: Fonts.regular },
  messages: { padding: Spacing.lg, gap: 8, flexGrow: 1 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  emptyText: { fontSize: FontSize.sm, fontFamily: Fonts.regular, textAlign: 'center' },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowDoctor: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  bubbleText: { fontSize: FontSize.sm, fontFamily: Fonts.regular, lineHeight: 20 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    fontSize: FontSize.sm,
    fontFamily: Fonts.regular,
    paddingVertical: 10,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { fontSize: FontSize.sm, fontFamily: Fonts.regular, textAlign: 'center' },
});
