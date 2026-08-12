import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ScheduleItem } from '@/types';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, stackCardShadow, stackLayerOpacity } from '@/constants/theme';
import { Icon, scheduleIcons } from '@/components/ui';
import { SCHEDULE_ICON } from './card-colors';
import { animateStackLayout, useAutoStackCycle } from './use-auto-stack-cycle';

const STACK_PEEK = 14;
const CARD_HEIGHT = 118;
const AUTO_INTERVAL_MS = 3000;

type Props = {
  items: ScheduleItem[];
  doneCount: number;
  onItemPress: (item: ScheduleItem) => void;
  onSeeAll: () => void;
};

function ScheduleStackCard({
  item,
  stackIndex,
  total,
  expanded,
  onPress,
}: {
  item: ScheduleItem;
  stackIndex: number;
  total: number;
  expanded: boolean;
  onPress: () => void;
}) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const iconName = scheduleIcons[item.type] ?? scheduleIcons.other;
  const isFront = !expanded && stackIndex === 0;
  const iconStyle = item.done ? SCHEDULE_ICON.done : SCHEDULE_ICON.active;

  const animatedStyle = useAnimatedStyle(() => {
    if (expanded) {
      return { transform: [{ translateY: 0 }, { scale: 1 }], opacity: 1, zIndex: total - stackIndex };
    }
    const y = stackIndex * STACK_PEEK;
    const scale = 1 - stackIndex * 0.035;
    return {
      transform: [{ translateY: y }, { scale }],
      opacity: stackLayerOpacity(false, stackIndex),
      zIndex: total - stackIndex,
    };
  }, [expanded, stackIndex, total]);

  return (
    <Animated.View
      pointerEvents={expanded || isFront ? 'auto' : 'none'}
      style={[styles.cardWrap, expanded && styles.cardWrapExpanded, animatedStyle]}
    >
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.94 : 1 }]}>
        <View style={[styles.card, stackCardShadow(expanded, stackIndex), { backgroundColor: colors.backgroundCard }]}>
          <View style={styles.cardTop}>
            <View style={[styles.cardIcon, { backgroundColor: iconStyle.bg }]}>
              <Icon name={iconName} size="md" color={iconStyle.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardHint, { color: colors.textMuted }]}>
                {item.done ? 'Selesai' : 'Selanjutnya'}
              </Text>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.label}</Text>
              {item.detail ? (
                <Text style={[styles.cardDetail, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.detail}
                </Text>
              ) : null}
            </View>
            <View style={[styles.timeBadge, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.timeText, { color: colors.textSecondary }]}>{item.time}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function ScheduleStack({ items, doneCount, onItemPress, onSeeAll }: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const [expanded, setExpanded] = useState(false);
  const pending = items.filter((i) => !i.done);
  const displayItems = pending.length > 0 ? pending : items;
  const stackItems = displayItems.slice(0, 3);
  const order = useAutoStackCycle(stackItems.length, AUTO_INTERVAL_MS, expanded);

  const toggleExpanded = useCallback(() => {
    animateStackLayout();
    setExpanded((v) => !v);
  }, []);

  if (items.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Jadwal hari ini</Text>
          <Pressable onPress={onSeeAll} hitSlop={8}>
            <Text style={styles.link}>Buat jadwal</Text>
          </Pressable>
        </View>
        <Pressable onPress={onSeeAll} style={styles.emptyCard}>
          <Icon name="calendar-outline" size="lg" color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum ada jadwal</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Tap untuk buat jadwal harian</Text>
        </Pressable>
      </View>
    );
  }

  const stackHeight = expanded
    ? stackItems.length * (CARD_HEIGHT + 10) + 8
    : CARD_HEIGHT + (stackItems.length - 1) * STACK_PEEK + 8;
  const pct = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Jadwal hari ini</Text>
          <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
            {doneCount}/{items.length} selesai · {pct}%
          </Text>
        </View>
        <Pressable onPress={expanded ? toggleExpanded : (items.length > stackItems.length ? toggleExpanded : onSeeAll)} hitSlop={8}>
          <Text style={styles.link}>{expanded ? 'Tumpuk' : items.length > 1 ? 'Lihat semua' : 'Semua'}</Text>
        </Pressable>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.primaryLight }]}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
      </View>

      {stackItems.length > 0 ? (
        <View style={[styles.stackContainer, expanded ? styles.stackExpanded : { height: stackHeight }]}>
          {(expanded ? items : stackItems).map((item, index) => {
            const stackIndex = expanded ? 0 : (index - order + stackItems.length) % stackItems.length;
            return (
              <ScheduleStackCard
                key={item.id}
                item={item}
                stackIndex={stackIndex}
                total={expanded ? items.length : stackItems.length}
                expanded={expanded}
                onPress={() => onItemPress(item)}
              />
            );
          })}
        </View>
      ) : null}

      {expanded ? (
        <Pressable onPress={onSeeAll} style={styles.seeScheduleLink}>
          <Text style={styles.link}>Buka halaman jadwal →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.bold,
    letterSpacing: -0.3,
  },
  progressLabel: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  link: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
    color: Colors.light.primary,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
  },
  stackContainer: { position: 'relative', width: '100%' },
  stackExpanded: { gap: 10 },
  cardWrap: { position: 'absolute', left: 0, right: 0, top: 0 },
  cardWrapExpanded: { position: 'relative' },
  card: {
    minHeight: CARD_HEIGHT,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHint: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontFamily: Fonts.bold,
    marginTop: 2,
  },
  cardDetail: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  timeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  timeText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
  },
  seeScheduleLink: { alignItems: 'center', paddingTop: 4 },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  emptyTitle: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.bold,
  },
  emptyDesc: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
});
