import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated, useColorScheme,
} from 'react-native';
import { ChatMessage } from '@/types';
import { Colors, Fonts, FontSize, BorderRadius } from '@/constants/theme';
import { VerifBadge, RequestVerifButton } from './verif-badge';
import { Icon } from '@/components/ui';
import { ThinkingBlock } from './thinking-block';
import { MarkdownContent } from './markdown-content';

interface ChatBubbleProps {
  message: ChatMessage;
  onRequestVerif?: (messageId: number) => void;
  isVerifLoading?: boolean;
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

  const showRequestVerif =
    !isUser && message.needsVerif && !message.verifStatus;
  const showVerifBadge =
    !isUser && message.needsVerif && message.verifStatus != null;

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
          {isUser ? (
            <Text style={[styles.plainText, { color: '#FFFFFF' }]}>{message.content}</Text>
          ) : (
            <MarkdownContent text={message.content} variant="assistant" />
          )}
        </View>

        {!isUser && (message.thinkingSummary || message.thinkingDetail) && (
          <ThinkingBlock
            summary={message.thinkingSummary}
            detail={message.thinkingDetail}
          />
        )}

        {showVerifBadge && (
          <VerifBadge
            status={message.verifStatus!}
            doctorName={message.verifDoctorName}
            note={message.verifNote}
          />
        )}

        {showRequestVerif && (
          <RequestVerifButton
            onPress={() => onRequestVerif?.(message.id)}
            loading={isVerifLoading}
          />
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
  plainText: { fontSize: FontSize.sm, lineHeight: 20, fontFamily: Fonts.regular },
  timestamp: { fontSize: FontSize.xs, paddingHorizontal: 4, fontFamily: Fonts.regular },
  timestampUser: { textAlign: 'right' },
});
