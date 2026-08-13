import React, { useEffect } from 'react';
import { StyleSheet, Text, useColorScheme, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Fonts, FontSize, BorderRadius } from '@/constants/theme';
import { useTypewriter } from '@/hooks/use-typewriter';

type Props = {
  title?: string;
  text: string;
  visible?: boolean;
  align?: 'left' | 'right';
};

export function HealyBubble({ title, text, visible = true, align = 'right' }: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);
  const displayed = useTypewriter(text, 20, visible);

  useEffect(() => {
    if (!visible) return;
    opacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
  }, [opacity, text, translateY, visible]);

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const tailStyle: ViewStyle = align === 'left'
    ? { left: 20, right: undefined }
    : { right: 20, left: undefined };

  return (
    <Animated.View
      style={[
        styles.wrap,
        bubbleStyle,
        { backgroundColor: colors.backgroundCard, borderColor: colors.borderLight },
      ]}
    >
      {title ? (
        <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
      ) : null}
      <Text style={[styles.body, { color: colors.text }]}>
        {displayed}
        {displayed.length < text.length ? (
          <Text style={{ color: colors.primary }}>|</Text>
        ) : null}
      </Text>
      <View style={[styles.tail, tailStyle, { borderTopColor: colors.backgroundCard }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    maxWidth: 260,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 4,
  },
  title: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
    marginBottom: 4,
  },
  body: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    fontFamily: Fonts.regular,
  },
  tail: {
    position: 'absolute',
    bottom: -7,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
