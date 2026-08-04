import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity, View, Text, StyleSheet, Animated,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

interface HeallyFABProps {
  isOpen: boolean;
  onPress: () => void;
  hasUnread?: boolean;
}

export function HeallyFAB({ isOpen, onPress, hasUnread = false }: HeallyFABProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  // Pulse animation when not open and not read
  useEffect(() => {
    if (!isOpen && !hasUnread) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
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
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.fab}
    >
      {/* Pulse ring */}
      {!isOpen && (
        <Animated.View
          style={[
            styles.pulseRing,
            { transform: [{ scale: pulseAnim }], borderColor: colors.primary },
          ]}
        />
      )}

      {/* Main button */}
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: isOpen ? colors.primaryDark : colors.primary,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {isOpen ? (
          <Text style={styles.closeIcon}>✕</Text>
        ) : (
          <Text style={styles.icon}>🤖</Text>
        )}
      </Animated.View>

      {/* AI badge */}
      {!isOpen && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>AI</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'relative',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    opacity: 0.4,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 24,
  },
  closeIcon: {
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '900',
  },
});
