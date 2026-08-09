import React, { useEffect, useState } from 'react';
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
  onRequestVerif?: (message: ChatMessage) => void;
  isVerifLoading?: boolean;
}

export function ChatBubble({ message, onRequestVerif, isVerifLoading }: ChatBubbleProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const isUser = message.role === 'user';

  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(isUser ? 16 : -16));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

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

        {!isUser && (message.thinkingSummary || message.thinkingDetail) ? (
          <ThinkingBlock
            summary={message.thinkingSummary}
            detail={message.thinkingDetail}
          />
        ) : null}

        {!isUser && message.safetyLevel !== 'general' ? (
          <View style={[
            styles.safetyNote,
            message.safetyLevel === 'urgent'
              ? { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }
              : { backgroundColor: colors.amberLight, borderColor: '#FDE68A' },
          ]}>
            <Icon
              name="warning-outline"
              size="sm"
              color={message.safetyLevel === 'urgent' ? '#B91C1C' : colors.amber}
            />
            <Text style={[
              styles.safetyText,
              { color: message.safetyLevel === 'urgent' ? '#B91C1C' : colors.amber },
            ]}>
              {message.safetyLevel === 'urgent'
                ? 'Kemungkinan darurat: hubungi layanan darurat atau IGD terdekat.'
                : 'Saran ini sebaiknya diverifikasi dokter sebelum diterapkan.'}
            </Text>
          </View>
        ) : null}

        {showVerifBadge ? (
          <VerifBadge
            status={message.verifStatus!}
            doctorName={message.verifDoctorName}
            note={message.verifNote}
          />
        ) : null}

        {showRequestVerif && onRequestVerif ? (
          <RequestVerifButton
            onPress={() => onRequestVerif(message)}
            loading={isVerifLoading}
          />
        ) : null}

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
  safetyNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    padding: 8, borderWidth: 1, borderRadius: BorderRadius.sm,
  },
  safetyText: { flex: 1, fontSize: FontSize.xs, lineHeight: 17, fontFamily: Fonts.medium },
  timestamp: { fontSize: FontSize.xs, paddingHorizontal: 4, fontFamily: Fonts.regular },
  timestampUser: { textAlign: 'right' },
});
