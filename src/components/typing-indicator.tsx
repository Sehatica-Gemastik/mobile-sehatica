import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, useColorScheme } from 'react-native';
import { Colors, BorderRadius } from '@/constants/theme';

export function TypingIndicator() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: -6, duration: 250, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.delay(450 - i * 150),
        ])
      )
    );
    Animated.parallel(animations).start();
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Animated.Text style={{ fontSize: 16 }}>🤖</Animated.Text>
      </View>
      <View style={[styles.bubble, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
        <View style={styles.dots}>
          {dots.map((dot, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: colors.textMuted, transform: [{ translateY: dot }] },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    height: 16,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
