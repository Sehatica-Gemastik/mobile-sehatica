import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { RiskProfile, RiskScore, DataSource, SmokingHabit } from '@/types';

export interface RiskProfileInput {
  tensiSistolik?: number;
  tensiDiastolik?: number;
  gulaDarahPuasa?: number;
  tinggiCm?: number;
  beratKg?: number;
  lingkarPerutCm?: number;
  riwayatKeluarga?: { hipertensi: boolean; diabetes: boolean; jantung: boolean; stroke: boolean };
  kebiasaanMerokok?: SmokingHabit;
  frekuensiSayurBuahPerMinggu?: number;
  frekuensiAktivitasFisikPerMinggu?: number;
  jenisAktivitas?: string;
  sumberData?: DataSource;
}

export const riskService = {
  get: () => api.get<RiskProfile | null>(API_ENDPOINTS.riskProfile),

  upsert: (data: RiskProfileInput) =>
    api.post<{ profile: RiskProfile; scoreResult: { level: string; skorMentah: number } }>(
      API_ENDPOINTS.riskProfile,
      { sumberData: 'manual', ...data }
    ),

  getLatestScore: () => api.get<RiskScore | null>(API_ENDPOINTS.scoringLatest),
};
