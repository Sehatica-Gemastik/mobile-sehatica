import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors, Fonts, FontSize, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { Icon } from '@/components/ui';
import type { RiskScore, PtmRiskResult, PtmTarget } from '@/services/ptm-risk.service';
import { PTM_LABELS, PTM_ICONS } from '@/services/ptm-risk.service';

function riskTier(probability: number): { label: string; color: string } {
  if (probability < 0.3) return { label: 'Rendah', color: '#22C55E' };
  if (probability < 0.6) return { label: 'Sedang', color: '#F59E0B' };
  return { label: 'Tinggi', color: '#EF4444' };
}

function ScoreRing({
  progress,
  color,
  trackColor,
  children,
}: {
  progress: number;
  color: string;
  trackColor: string;
  children: React.ReactNode;
}) {
  const clamped = Math.min(1, Math.max(0, progress));
  const filled = clamped >= 0.999;

  return (
    <View style={styles.ringWrap}>
      <View style={[styles.ringTrack, { borderColor: trackColor }]} />
      <View
        style={[
          styles.ringProgress,
          {
            borderTopColor: color,
            borderRightColor: clamped > 0.25 || filled ? color : trackColor,
            borderBottomColor: clamped > 0.5 || filled ? color : trackColor,
            borderLeftColor: clamped > 0.75 || filled ? color : trackColor,
            transform: [{ rotate: '-90deg' }],
          },
        ]}
      />
      <View style={styles.ringCenter}>{children}</View>
    </View>
  );
}

type Props = {
  data: PtmRiskResult;
};

export function RiskCard({ data }: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const hasScore = data.dataComplete;
  const overallPct = Math.round(data.overallScore * 100);
  const overallTier = hasScore ? riskTier(data.overallScore) : { label: 'Belum dihitung', color: colors.textMuted };
  const modelLabel = data.featureSet === 'clinical' ? 'model klinis' : 'model gaya hidup';

  return (
    <View style={[styles.card, Shadows.sm, { backgroundColor: colors.backgroundCard }]}>
      <View style={styles.hero}>
        <ScoreRing
          progress={hasScore ? data.overallScore : 0}
          color={overallTier.color}
          trackColor={colors.backgroundElement}
        >
          <Text style={[styles.heroScore, { color: colors.text }]}>
            {hasScore ? (data.overallScore * 10).toFixed(1) : '0.0'}
          </Text>
        </ScoreRing>

        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {hasScore ? `${overallTier.label}!` : overallTier.label}
          </Text>
          <Text style={[styles.heroSub, { color: colors.textMuted }]}>
            {hasScore
              ? `Skor risiko PTM ${overallPct}% · ${modelLabel}`
              : 'Isi kuisioner harian untuk menghitung skor risiko PTM'}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

      <View style={styles.detail}>
        <Text style={[styles.detailKicker, { color: colors.textMuted }]}>
          Ringkasan indikator
        </Text>

        <View style={styles.metricGrid}>
          {data.risks.map((risk) => (
            <View key={risk.target} style={styles.metricCell}>
              <RiskMetric risk={risk} colors={colors} hasScore={hasScore} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function RiskMetric({ risk, colors, hasScore }: { risk: RiskScore; colors: typeof Colors.light; hasScore: boolean }) {
  const score = hasScore ? (risk.probability * 10).toFixed(1) : '0.0';

  return (
    <View style={styles.metricRow}>
      <View style={[styles.metricIcon, { backgroundColor: colors.primaryLight }]}>
        <Icon
          name={PTM_ICONS[risk.target as PtmTarget] as any}
          size="sm"
          color={colors.primary}
        />
      </View>

      <View style={styles.metricBody}>
        <Text style={[styles.metricScore, { color: colors.text }]}>{score}</Text>
        <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
          {PTM_LABELS[risk.target]}
        </Text>
      </View>
    </View>
  );
}

const RING_SIZE = 68;
const RING_STROKE = 4;

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTrack: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
  },
  ringProgress: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroScore: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    letterSpacing: -0.6,
  },
  heroCopy: {
    flex: 1,
    gap: 3,
  },
  heroTitle: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.bold,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    lineHeight: 15,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  detail: {
    flexDirection: 'row',
    gap: 12,
  },
  detailKicker: {
    width: 72,
    fontSize: 10,
    fontFamily: Fonts.medium,
    lineHeight: 14,
    paddingTop: 2,
  },
  metricGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCell: {
    width: '47%',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  metricBody: {
    flex: 1,
    gap: 1,
    paddingTop: 1,
  },
  metricScore: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.bold,
    letterSpacing: -0.2,
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    lineHeight: 14,
  },
});
