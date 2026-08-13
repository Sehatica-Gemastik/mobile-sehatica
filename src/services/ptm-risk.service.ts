import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';

export type PtmTarget = 'diabetes' | 'hypertension' | 'heart_disease' | 'stroke';

export type RiskScore = {
  target: PtmTarget;
  probability: number;
  isAtRisk: boolean;
  threshold: number;
};

export type PtmRiskResult = {
  featureSet: 'lifestyle' | 'clinical';
  overallScore: number;
  overallIsAtRisk: boolean;
  dataComplete: boolean;
  risks: RiskScore[];
};

export type PtmInputPayload = {
  age?: number | null;
  sex?: number | null;
  race_ethnicity?: number | null;
  education?: number | null;
  income_poverty_ratio?: number | null;
  [key: string]: number | null | undefined;
};

export const PTM_LABELS: Record<PtmTarget, string> = {
  diabetes: 'Diabetes',
  hypertension: 'Hipertensi',
  heart_disease: 'Jantung',
  stroke: 'Stroke',
};

export const PTM_ICONS: Record<PtmTarget, string> = {
  diabetes: 'water-outline',
  hypertension: 'heart-outline',
  heart_disease: 'pulse-outline',
  stroke: 'flash-outline',
};

export const ptmRiskService = {
  predict: (payload: PtmInputPayload) =>
    api.post<PtmRiskResult>(API_ENDPOINTS.ptmRisk, payload),
};
