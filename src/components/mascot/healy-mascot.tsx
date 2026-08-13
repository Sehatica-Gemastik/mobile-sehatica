import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const HEALY_SIZE = 92;

type Props = {
  size?: number;
};

export function HealyMascotBody({ size = HEALY_SIZE }: Props) {
  const eyeW = size * 0.1;
  const eyeH = size * 0.18;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <LinearGradient
        colors={['#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9']}
        locations={[0, 0.35, 0.72, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.blob, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <View
          style={[
            styles.highlight,
            {
              width: size * 0.68,
              height: size * 0.34,
              borderTopLeftRadius: size * 0.34,
              borderTopRightRadius: size * 0.34,
              top: size * 0.08,
            },
          ]}
        />

        <View style={[styles.eyes, { marginTop: size * 0.22 }]}>
          <View
            style={[
              styles.eye,
              {
                width: eyeW,
                height: eyeH,
                borderRadius: eyeW,
                transform: [{ rotate: '14deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.eye,
              {
                width: eyeW,
                height: eyeH,
                borderRadius: eyeW,
                transform: [{ rotate: '-14deg' }],
              },
            ]}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    overflow: 'hidden',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  eyes: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  eye: {
    backgroundColor: '#FFFFFF',
  },
});
