"use no memo";

import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import React from 'react';
import type { PatientAppointment } from '@/services/appointments.service';
import type { PtmRiskResult } from '@/services/ptm-risk.service';
import { SehaticaDashboardWidget } from './SehaticaDashboardWidget';
import { clearWidgetSnapshot, saveWidgetSnapshot } from './snapshot-storage';
import {
  emptyWidgetSnapshot,
  riskTierLabel,
  SEHATICA_DASHBOARD_WIDGET,
  type WidgetSnapshot,
} from './types';

export type SyncWidgetInput = {
  signedIn: boolean;
  userName?: string | null;
  dailyDone: boolean;
  weeklyDue?: boolean;
  ptmRisk?: PtmRiskResult | null;
  appointmentsToday?: PatientAppointment[];
};

function mapAppointments(items: PatientAppointment[] = []) {
  return items.slice(0, 3).map((item) => {
    const start = new Date(item.start);
    return {
      id: item.id,
      title: item.title,
      doctorName: item.doctorName,
      time: start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
  });
}

export function buildWidgetSnapshot(input: SyncWidgetInput): WidgetSnapshot {
  const ready = Boolean(input.ptmRisk?.dataComplete);
  const score = ready ? input.ptmRisk!.overallScore : null;

  return emptyWidgetSnapshot({
    signedIn: input.signedIn,
    userName: input.userName ?? null,
    dailyDone: input.dailyDone,
    weeklyDue: Boolean(input.weeklyDue),
    ptmReady: ready,
    ptmScore: score,
    ptmTier: ready && score != null ? riskTierLabel(score) : 'Belum dihitung',
    appointments: mapAppointments(input.appointmentsToday),
  });
}

async function drawWidget(data: WidgetSnapshot) {
  if (Platform.OS !== 'android') return;
  await requestWidgetUpdate({
    widgetName: SEHATICA_DASHBOARD_WIDGET,
    renderWidget: () => <SehaticaDashboardWidget data={data} />,
  });
}

export async function syncSehaticaWidget(input: SyncWidgetInput): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const snapshot = buildWidgetSnapshot(input);
    await saveWidgetSnapshot(snapshot);
    await drawWidget(snapshot);
  } catch (err) {
    if (__DEV__) console.warn('[widget] sync failed', err);
  }
}

export async function clearSehaticaWidget(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await clearWidgetSnapshot();
    await drawWidget(emptyWidgetSnapshot({ signedIn: false }));
  } catch (err) {
    if (__DEV__) console.warn('[widget] clear failed', err);
  }
}

export async function requestAddSehaticaWidget(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  const { requestPinWidget } = await import('react-native-android-widget');
  try {
    return await requestPinWidget({ widgetName: SEHATICA_DASHBOARD_WIDGET });
  } catch (err) {
    if (__DEV__) console.warn('[widget] pin failed', err);
    return false;
  }
}
