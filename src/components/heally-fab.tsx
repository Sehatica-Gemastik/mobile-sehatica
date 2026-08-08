import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, StyleSheet, Animated, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { Icon } from '@/components/ui';

interface HeallyFABProps {
  isOpen: boolean;
  onPress: () => void;
  hasUnread?: boolean;
}

export function HeallyFAB({ isOpen, onPress, hasUnread = false }: HeallyFABProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  useEffect(() => {
    if (!isOpen && !hasUnread) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
    pulseAnim.setValue(1);
  }, [isOpen, hasUnread]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={styles.fab}>
      {!isOpen && (
        <Animated.View
          style={[
            styles.pulseRing,
            { transform: [{ scale: pulseAnim }], borderColor: colors.primary },
          ]}
        />
      )}
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: isOpen ? colors.primaryDark : colors.primary,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Icon
          name={isOpen ? 'close' : 'sparkles'}
          size="md"
          color={colors.onPrimary}
        />
      </Animated.View>
      {!isOpen && (
        <View style={[styles.badge, { backgroundColor: colors.amber }]}>
          <Animated.Text style={styles.badgeText}>AI</Animated.Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'relative',
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    opacity: 0.35,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '800',
  },
});
