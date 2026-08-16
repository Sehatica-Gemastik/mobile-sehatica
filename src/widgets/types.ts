export const SEHATICA_DASHBOARD_WIDGET = 'SehaticaDashboard';

export type WidgetAppointmentItem = {
  id: string;
  title: string;
  time: string;
  doctorName: string;
};

export type WidgetSnapshot = {
  updatedAt: string;
  signedIn: boolean;
  userName: string | null;
  dateLabel: string;
  ptmScore: number | null;
  ptmTier: string;
  ptmReady: boolean;
  dailyDone: boolean;
  weeklyDue: boolean;
  appointments: WidgetAppointmentItem[];
};

export function emptyWidgetSnapshot(partial?: Partial<WidgetSnapshot>): WidgetSnapshot {
  return {
    updatedAt: new Date().toISOString(),
    signedIn: false,
    userName: null,
    dateLabel: new Date().toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }),
    ptmScore: null,
    ptmTier: 'Belum dihitung',
    ptmReady: false,
    dailyDone: false,
    weeklyDue: false,
    appointments: [],
    ...partial,
  };
}

export function riskTierLabel(probability: number): string {
  if (probability < 0.3) return 'Rendah';
  if (probability < 0.6) return 'Sedang';
  return 'Tinggi';
}
