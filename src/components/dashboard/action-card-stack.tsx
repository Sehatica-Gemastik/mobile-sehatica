import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, stackCardShadow, stackLayerOpacity } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui';
import { iconStyleForStatus, CardStatus } from './card-colors';
import { animateStackLayout, useAutoStackCycle } from './use-auto-stack-cycle';

export type ActionCardItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  status: CardStatus;
  onPress: () => void;
};

type Props = {
  cards: ActionCardItem[];
  sectionTitle?: string;
};

const STACK_PEEK = 16;
const CARD_HEIGHT = 132;
const AUTO_INTERVAL_MS = 3000;

function StackCard({
  card,
  index,
  total,
  order,
  expanded,
  onPress,
}: {
  card: ActionCardItem;
  index: number;
  total: number;
  order: number;
  expanded: boolean;
  onPress: () => void;
}) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const stackIndex = expanded ? 0 : (index - order + total) % total;
  const isFront = !expanded && stackIndex === 0;
  const iconStyle = iconStyleForStatus(card.status);

  const animatedStyle = useAnimatedStyle(() => {
    if (expanded) {
      return {
        transform: [{ translateY: 0 }, { scale: 1 }],
        opacity: 1,
        zIndex: total - index,
      };
    }
    const y = stackIndex * STACK_PEEK;
    const scale = 1 - stackIndex * 0.04;
    const opacity = stackLayerOpacity(false, stackIndex);
    return {
      transform: [{ translateY: y }, { scale }],
      opacity,
      zIndex: total - stackIndex,
    };
  }, [expanded, stackIndex, total]);

  return (
    <Animated.View
      pointerEvents={expanded || isFront ? 'auto' : 'none'}
      style={[styles.cardWrap, expanded && styles.cardWrapExpanded, animatedStyle]}
    >
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
        <View style={[styles.card, stackCardShadow(expanded, stackIndex), { backgroundColor: colors.backgroundCard }]}>
          <View style={[styles.cardIcon, { backgroundColor: iconStyle.bg }]}>
            <Icon name={card.icon} size="md" color={iconStyle.color} />
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{card.title}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={expanded ? 4 : 2}>
              {card.subtitle}
            </Text>
          </View>
          <Icon name="chevron-forward" size="sm" color={colors.textMuted} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function ActionCardStack({ cards, sectionTitle = 'Yang perlu diperhatikan' }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visibleCards = useMemo(() => cards.filter(Boolean), [cards]);
  const order = useAutoStackCycle(visibleCards.length, AUTO_INTERVAL_MS, expanded);

  const toggleExpanded = useCallback(() => {
    animateStackLayout();
    setExpanded((v) => !v);
  }, []);

  if (visibleCards.length === 0) return null;

  const stackHeight = expanded
    ? visibleCards.length * (CARD_HEIGHT + 12) + 8
    : CARD_HEIGHT + (visibleCards.length - 1) * STACK_PEEK + 12;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        {visibleCards.length > 1 ? (
          <Pressable onPress={toggleExpanded} hitSlop={8}>
            <Text style={styles.toggleText}>{expanded ? 'Tumpuk' : 'Lihat semua'}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.stackContainer, expanded ? styles.stackExpanded : { height: stackHeight }]}>
        {visibleCards.map((card, index) => (
          <StackCard
            key={card.id}
            card={card}
            index={index}
            total={visibleCards.length}
            order={order}
            expanded={expanded}
            onPress={card.onPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.bold,
    color: Colors.light.text,
    letterSpacing: -0.3,
  },
  toggleText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
    color: Colors.light.primary,
  },
  stackContainer: {
    position: 'relative',
    width: '100%',
  },
  stackExpanded: {
    gap: 12,
  },
  cardWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  cardWrapExpanded: {
    position: 'relative',
  },
  card: {
    minHeight: CARD_HEIGHT,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.bold,
    lineHeight: 20,
  },
  cardSubtitle: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.regular,
    lineHeight: 18,
  },
});
