"use no memo";

import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetSnapshot } from './types';
import { emptyWidgetSnapshot } from './types';

type Props = {
  data?: WidgetSnapshot | null;
};

function formatScore(score: number | null, ready: boolean): string {
  if (!ready || score == null) return '—';
  return (score * 10).toFixed(1);
}

function formatPct(score: number | null, ready: boolean): string {
  if (!ready || score == null) return 'Risiko PTM belum dihitung';
  return `Risiko PTM ${Math.round(score * 100)}%`;
}

function appointmentLine(data: WidgetSnapshot): string {
  if (!data.appointments.length) return 'Belum ada janji hari ini';
  const first = data.appointments[0];
  const more = data.appointments.length > 1 ? ` · +${data.appointments.length - 1}` : '';
  return `${first.time} · ${first.title} · ${first.doctorName}${more}`;
}

export function SehaticaDashboardWidget({ data }: Props) {
  const snapshot = data ?? emptyWidgetSnapshot();

  if (!snapshot.signedIn) {
    return (
      <FlexWidget
        clickAction="OPEN_APP"
        style={{
          height: 'match_parent',
          width: 'match_parent',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 16,
          borderRadius: 20,
          backgroundGradient: {
            from: '#38BDF8',
            to: '#F0F9FF',
            orientation: 'TOP_BOTTOM',
          },
        }}
      >
        <TextWidget
          text="Sehatica"
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: 6,
          }}
        />
        <TextWidget
          text="Buka aplikasi dan login untuk melihat risiko PTM, kuisioner, dan janji hari ini."
          style={{
            fontSize: 12,
            color: '#0C4A6E',
          }}
        />
      </FlexWidget>
    );
  }

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 20,
        backgroundGradient: {
          from: '#38BDF8',
          to: '#F0F9FF',
          orientation: 'TOP_BOTTOM',
        },
      }}
    >
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text="Sehatica"
          style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}
        />
        <TextWidget
          text={snapshot.dateLabel}
          style={{ fontSize: 11, color: '#FFFFFF', fontWeight: '500' }}
        />
      </FlexWidget>

      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 8,
        }}
      >
        <FlexWidget
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: 'rgba(255, 255, 255, 0.55)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <TextWidget
            text={formatScore(snapshot.ptmScore, snapshot.ptmReady)}
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#0F172A',
              textAlign: 'center',
            }}
          />
        </FlexWidget>

        <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
          <TextWidget
            text={snapshot.ptmTier}
            style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}
          />
          <TextWidget
            text={formatPct(snapshot.ptmScore, snapshot.ptmReady)}
            style={{ fontSize: 11, color: '#075985', marginTop: 2 }}
          />
        </FlexWidget>
      </FlexWidget>

      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'column',
          marginTop: 10,
          padding: 10,
          borderRadius: 14,
          backgroundColor: 'rgba(255, 255, 255, 0.72)',
        }}
      >
        <TextWidget
          text={snapshot.dailyDone ? 'Kuisioner · Sudah diisi' : 'Kuisioner · Belum diisi'}
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: snapshot.dailyDone ? '#15803D' : '#B45309',
            marginBottom: 4,
          }}
        />
        <TextWidget
          text={`Janji · ${appointmentLine(snapshot)}`}
          truncate="END"
          maxLines={2}
          style={{
            fontSize: 11,
            color: '#334155',
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
