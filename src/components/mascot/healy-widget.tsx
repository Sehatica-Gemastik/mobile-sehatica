import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAuthStore } from '@/store/auth-store';
import { getTabBarHeight } from '@/components/app-tabs';
import { syncRdsaNow } from '@/hooks/use-rdsa-sync';
import { HealyCorner, HealyMessage, useHealyStore } from '@/store/healy-store';
import { HealyBubble } from './healy-bubble';
import { HealyMascotBody, HEALY_SIZE } from './healy-mascot';

const AUTO_DISMISS_MS = 15_000;
const NEXT_MESSAGE_MIN_MS = 4_000;
const NEXT_MESSAGE_MAX_MS = 8_000;
const HORIZONTAL_PEEK = 28;
const TAB_OVERLAP = 14;

function sideFromCorner(corner: HealyCorner): 'left' | 'right' {
  return corner === 'bottom-left' ? 'left' : 'right';
}

type MessageViewProps = {
  message: HealyMessage;
  onFinished: () => void;
};

function HealyMessageView({ message, onFinished }: MessageViewProps) {
  const side = useMemo(() => sideFromCorner(message.corner), [message.corner]);
  const exitingRef = useRef(false);

  const mascotX = useSharedValue(side === 'right' ? 64 : -64);
  const mascotY = useSharedValue(64);
  const mascotRotate = useSharedValue(side === 'right' ? 10 : -10);
  const bubbleOpacity = useSharedValue(0);
  const bubbleShift = useSharedValue(12);

  const playEntry = useCallback(() => {
    mascotX.value = side === 'right' ? 64 : -64;
    mascotY.value = 64;
    mascotRotate.value = side === 'right' ? 10 : -10;
    bubbleOpacity.value = 0;
    bubbleShift.value = 12;

    mascotX.value = withSpring(0, { damping: 14, stiffness: 155, mass: 0.8 });
    mascotY.value = withSpring(0, { damping: 14, stiffness: 155, mass: 0.8 });
    mascotRotate.value = withSequence(
      withTiming(side === 'right' ? -4 : 4, { duration: 240, easing: Easing.out(Easing.cubic) }),
      withSpring(0, { damping: 12, stiffness: 130 }),
    );
    bubbleOpacity.value = withDelay(180, withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) }));
    bubbleShift.value = withDelay(180, withSpring(0, { damping: 14, stiffness: 150 }));
  }, [bubbleOpacity, bubbleShift, mascotRotate, mascotX, mascotY, side]);

  const finishExit = useCallback(() => {
    exitingRef.current = false;
    onFinished();
  }, [onFinished]);

  const playExit = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;

    bubbleOpacity.value = withTiming(0, { duration: 220, easing: Easing.in(Easing.cubic) });
    bubbleShift.value = withTiming(10, { duration: 220 });
    mascotRotate.value = withTiming(side === 'right' ? 8 : -8, { duration: 280 });
    mascotX.value = withTiming(side === 'right' ? 64 : -64, { duration: 320, easing: Easing.in(Easing.cubic) });
    mascotY.value = withTiming(
      64,
      { duration: 320, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(finishExit)();
      },
    );
  }, [bubbleOpacity, bubbleShift, finishExit, mascotRotate, mascotX, mascotY, side]);

  useEffect(() => {
    playEntry();
  }, [message.id, playEntry]);

  useEffect(() => {
    const timer = setTimeout(() => {
      playExit();
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [message.id, playExit]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: mascotX.value },
      { translateY: mascotY.value },
      { rotate: `${mascotRotate.value}deg` },
    ],
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: bubbleOpacity.value,
    transform: [{ translateY: bubbleShift.value }],
  }));

  return (
    <View style={[styles.messageWrap, side === 'left' ? styles.messageLeft : styles.messageRight]}>
      <Animated.View
        style={[
          styles.bubbleWrap,
          side === 'left' ? styles.bubbleLeft : styles.bubbleRight,
          bubbleStyle,
        ]}
      >
        <Pressable onPress={playExit}>
          <HealyBubble title={message.title} text={message.text} align={side} />
        </Pressable>
      </Animated.View>

      <Pressable onPress={playExit} accessibilityLabel="Healy" hitSlop={12}>
        <Animated.View
          style={[
            side === 'left' ? styles.mascotLeft : styles.mascotRight,
            mascotStyle,
          ]}
        >
          <HealyMascotBody size={HEALY_SIZE} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

function randomGapMs() {
  return NEXT_MESSAGE_MIN_MS + Math.floor(Math.random() * (NEXT_MESSAGE_MAX_MS - NEXT_MESSAGE_MIN_MS + 1));
}

export function HealyWidget() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const current = useHealyStore((s) => s.current);
  const showWelcome = useHealyStore((s) => s.showWelcome);
  const dismissCurrent = useHealyStore((s) => s.dismissCurrent);
  const enqueueIdleTip = useHealyStore((s) => s.enqueueIdleTip);
  const welcomeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextMessageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const welcomeText = user?.name
    ? `Halo, ${user.name.split(' ')[0]}! Senang kamu kembali.`
    : 'Halo! Senang kamu kembali.';

  const bottomOffset = getTabBarHeight(insets.bottom) - TAB_OVERLAP;

  const scheduleNextMessage = useCallback(() => {
    if (nextMessageTimer.current) clearTimeout(nextMessageTimer.current);

    nextMessageTimer.current = setTimeout(async () => {
      await syncRdsaNow().catch(() => null);

      const { current: active, queue } = useHealyStore.getState();
      if (!active && queue.length === 0) {
        enqueueIdleTip();
      }
    }, randomGapMs());
  }, [enqueueIdleTip]);

  const handleFinished = useCallback(() => {
    dismissCurrent();
    scheduleNextMessage();
  }, [dismissCurrent, scheduleNextMessage]);

  useEffect(() => {
    welcomeTimer.current = setTimeout(() => {
      showWelcome(welcomeText);
    }, 900);

    return () => {
      if (welcomeTimer.current) clearTimeout(welcomeTimer.current);
      if (nextMessageTimer.current) clearTimeout(nextMessageTimer.current);
    };
  }, [showWelcome, welcomeText]);

  if (!current) return null;

  const side = sideFromCorner(current.corner);

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View
        style={[
          styles.sticky,
          {
            bottom: bottomOffset,
            left: side === 'left' ? 0 : undefined,
            right: side === 'right' ? 0 : undefined,
          },
        ]}
        pointerEvents="box-none"
      >
        <HealyMessageView
          key={current.id}
          message={current}
          onFinished={handleFinished}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 40,
    elevation: 40,
  },
  sticky: {
    position: 'absolute',
    maxWidth: 300,
    overflow: 'visible',
  },
  messageWrap: {
    gap: 4,
    overflow: 'visible',
  },
  messageLeft: {
    alignItems: 'flex-start',
  },
  messageRight: {
    alignItems: 'flex-end',
  },
  bubbleWrap: {
    marginBottom: 2,
    maxWidth: 268,
  },
  bubbleLeft: {
    marginLeft: 12,
    alignSelf: 'flex-start',
  },
  bubbleRight: {
    marginRight: 12,
    alignSelf: 'flex-end',
  },
  mascotLeft: {
    marginLeft: -HORIZONTAL_PEEK,
  },
  mascotRight: {
    marginRight: -HORIZONTAL_PEEK,
  },
});
