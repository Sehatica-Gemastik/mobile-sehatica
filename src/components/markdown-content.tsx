import React, { useMemo } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Colors, Fonts, FontSize, BorderRadius } from '@/constants/theme';
import { Icon } from '@/components/ui';

/** Marker from LLM prompt — no emoji in chat output. */
export const WARNING_MARKER = '[PERINGATAN]';

interface MarkdownContentProps {
  text: string;
  variant?: 'assistant' | 'user';
}

function stripEmoji(text: string): string {
  return text
    .replace(/⚠️/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[\u2600-\u27BF]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function isWarningLine(line: string): boolean {
  const t = line.trim();
  return (
    t.includes(WARNING_MARKER) ||
    /^(\*\*)?PERINGATAN[:\*]/i.test(t) ||
    /^(\*\*)?Peringatan/i.test(t) ||
    t.includes('verifikasi dokter')
  );
}

/** Normalize LLM output before render. */
export function prepareChatMarkdown(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (trimmed.startsWith('>')) {
        return `> ${stripEmoji(trimmed.replace(/^>\s*/, ''))}`;
      }
      if (isWarningLine(trimmed)) {
        const cleaned = stripEmoji(
          trimmed.replace(WARNING_MARKER, '').replace(/^\*\*|\*\*$/g, '')
        );
        return `> ${cleaned}`.trim();
      }
      return stripEmoji(line);
    })
    .join('\n')
    .trim();
}

export function MarkdownContent({ text, variant = 'assistant' }: MarkdownContentProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const isUser = variant === 'user';
  const bodyColor = isUser ? '#FFFFFF' : colors.text;
  const codeBg = isUser ? 'rgba(255,255,255,0.15)' : colors.backgroundElement;
  const quoteBg = isUser ? 'rgba(255,255,255,0.12)' : colors.amberLight;
  const quoteBorder = isUser ? 'rgba(255,255,255,0.35)' : colors.amber;

  const markdown = useMemo(() => prepareChatMarkdown(text), [text]);

  const mdStyles = StyleSheet.create({
    body: { color: bodyColor, fontSize: FontSize.sm, lineHeight: 20, fontFamily: Fonts.regular },
    heading1: {
      color: bodyColor,
      fontSize: FontSize.lg,
      fontFamily: Fonts.bold,
      marginTop: 4,
      marginBottom: 6,
    },
    heading2: {
      color: bodyColor,
      fontSize: FontSize.md,
      fontFamily: Fonts.bold,
      marginTop: 4,
      marginBottom: 4,
    },
    heading3: {
      color: bodyColor,
      fontSize: FontSize.sm,
      fontFamily: Fonts.bold,
      marginTop: 2,
      marginBottom: 2,
    },
    strong: { fontFamily: Fonts.bold },
    em: { fontStyle: 'italic' },
    bullet_list: { marginVertical: 4 },
    ordered_list: { marginVertical: 4 },
    list_item: { marginVertical: 2 },
    paragraph: { marginTop: 0, marginBottom: 6 },
    fence: {
      backgroundColor: codeBg,
      borderRadius: BorderRadius.sm,
      padding: 10,
      fontFamily: Fonts.regular,
      fontSize: FontSize.xs,
      color: bodyColor,
      marginVertical: 6,
    },
    code_inline: {
      backgroundColor: codeBg,
      borderRadius: 4,
      paddingHorizontal: 4,
      fontFamily: Fonts.regular,
      fontSize: FontSize.xs,
      color: bodyColor,
    },
    blockquote: {
      backgroundColor: quoteBg,
      borderLeftWidth: 3,
      borderLeftColor: quoteBorder,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: BorderRadius.sm,
      marginVertical: 6,
      flexDirection: 'row',
      gap: 8,
      alignItems: 'flex-start',
    },
    hr: { backgroundColor: isUser ? 'rgba(255,255,255,0.25)' : colors.border, height: 1, marginVertical: 8 },
  });

  const rules = {
    blockquote: (node: { key: string }, children: React.ReactNode, _p: unknown, styles: typeof mdStyles) => (
      <View key={node.key} style={styles.blockquote}>
        <Icon name="warning-outline" size="sm" color={isUser ? '#FFFFFF' : colors.amber} />
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    ),
  };

  return (
    <View style={{ flexShrink: 1 }}>
      <Markdown style={mdStyles} rules={rules}>
        {markdown}
      </Markdown>
    </View>
  );
}
