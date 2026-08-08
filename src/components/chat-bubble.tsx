import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated, useColorScheme,
} from 'react-native';
import { ChatMessage } from '@/types';
import { Colors, Fonts, FontSize, BorderRadius } from '@/constants/theme';
import { VerifBadge, RequestVerifButton } from './verif-badge';
import { Icon } from '@/components/ui';

interface ChatBubbleProps {
  message: ChatMessage;
  onRequestVerif?: (messageId: number) => void;
  isVerifLoading?: boolean;
}

function RenderContent({ text, isUser }: { text: string; isUser: boolean }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const textColor = isUser ? '#FFFFFF' : colors.text;

  const lines = text.split('\n');
  return (
    <View style={{ gap: 2 }}>
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <Text key={i} style={[styles.bubbleText, { color: textColor }]}>
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <Text key={j} style={{ fontFamily: Fonts.bold }}>
                    {part.slice(2, -2)}
                  </Text>
                );
              }
              return part;
            })}
          </Text>
        );
      })}
    </View>
  );
}

export function ChatBubble({ message, onRequestVerif, isVerifLoading }: ChatBubbleProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const isUser = message.role === 'user';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isUser ? 16 : -16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const time = new Date(message.createdAt).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.containerUser : styles.containerAI,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Icon name="sparkles" size="sm" color={colors.onPrimary} />
        </View>
      )}

      <View style={[styles.bubbleGroup, isUser ? styles.bubbleGroupUser : styles.bubbleGroupAI]}>
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, { backgroundColor: colors.primary }]
              : [styles.bubbleAI, { backgroundColor: colors.backgroundCard, borderColor: colors.border }],
          ]}
        >
          <RenderContent text={message.content} isUser={isUser} />
        </View>

        {!isUser && message.needsVerif && (
          <View>
            {message.verifStatus === 'pending' ? (
              <VerifBadge status="pending" />
            ) : !message.verifStatus ? (
              <RequestVerifButton
                onPress={() => onRequestVerif?.(message.id)}
                loading={isVerifLoading}
              />
            ) : null}
            {message.verifStatus && message.verifStatus !== null ? (
              <VerifBadge
                status={message.verifStatus}
                doctorName={message.verifDoctorName}
                note={message.verifNote}
              />
            ) : null}
          </View>
        )}

        <Text
          style={[
            styles.timestamp,
            { color: colors.textMuted },
            isUser && styles.timestampUser,
          ]}
        >
          {time}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  containerUser: { justifyContent: 'flex-end' },
  containerAI: { justifyContent: 'flex-start' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  bubbleGroup: { maxWidth: '82%', gap: 4 },
  bubbleGroupUser: { alignItems: 'flex-end' },
  bubbleGroupAI: { alignItems: 'flex-start' },
  bubble: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleAI: { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: FontSize.sm, lineHeight: 20, fontFamily: Fonts.regular },
  timestamp: { fontSize: FontSize.xs, paddingHorizontal: 4, fontFamily: Fonts.regular },
  timestampUser: { textAlign: 'right' },
});
