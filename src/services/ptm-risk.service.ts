import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { predictPtmRiskLocal } from '@/features/ptm/inference';

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
  predict: async (payload: PtmInputPayload): Promise<PtmRiskResult> => {
    if (__DEV__) {
      console.log('[ptm] payload identity:', {
        age: payload.age, sex: payload.sex,
        race: payload.race_ethnicity, edu: payload.education, income: payload.income_poverty_ratio,
      });
      console.log('[ptm] payload daily:', {
        sedentary: payload.sedentary_minutes, vigorous: payload.vigorous_work, cal: payload.calories_day1,
      });
    }

    const local = predictPtmRiskLocal(payload);

    if (__DEV__) {
      console.log('[ptm] local result:', {
        complete: local.dataComplete, score: local.overallScore, set: local.featureSet,
        risks: local.risks.map((r) => `${r.target}:${r.probability}`),
      });
    }

    if (local.dataComplete) return local;

    try {
      const remote = await api.post<PtmRiskResult>(API_ENDPOINTS.ptmRisk, payload);
      if (__DEV__) console.log('[ptm] remote result:', { complete: remote.dataComplete, score: remote.overallScore });
      return remote;
    } catch (err) {
      if (__DEV__) console.warn('[ptm] api error, using local:', err);
      return local;
    }
  },
};
