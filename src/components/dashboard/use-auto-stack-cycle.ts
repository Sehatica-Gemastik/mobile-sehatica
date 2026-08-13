import { useEffect, useState } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function useAutoStackCycle(count: number, intervalMs = 3000, paused = false) {
  const [order, setOrder] = useState(0);

  useEffect(() => {
    setOrder(0);
  }, [count]);

  useEffect(() => {
    if (paused || count <= 1) return undefined;

    const id = setInterval(() => {
      LayoutAnimation.configureNext(LayoutAnimation.create(480, 'easeInEaseOut', 'opacity'));
      setOrder((o) => (o + 1) % count);
    }, intervalMs);

    return () => clearInterval(id);
  }, [count, intervalMs, paused]);

  return order;
}

export function animateStackLayout() {
  LayoutAnimation.configureNext(LayoutAnimation.create(480, 'easeInEaseOut', 'opacity'));
}
