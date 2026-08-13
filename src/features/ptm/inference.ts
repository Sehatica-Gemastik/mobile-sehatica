import type { PtmInputPayload, PtmRiskResult, PtmTarget } from '@/services/ptm-risk.service';
import { emptyPtmRiskResult } from './build-payload';

import lifestyleDiabetes from './models/lifestyle/diabetes.json';
import lifestyleHeartDisease from './models/lifestyle/heart_disease.json';
import lifestyleHypertension from './models/lifestyle/hypertension.json';
import lifestyleStroke from './models/lifestyle/stroke.json';
import clinicalDiabetes from './models/clinical/diabetes.json';
import clinicalHeartDisease from './models/clinical/heart_disease.json';
import clinicalHypertension from './models/clinical/hypertension.json';
import clinicalStroke from './models/clinical/stroke.json';

type PtmFeatureSet = 'lifestyle' | 'clinical';

type PtmModel = {
  threshold: number;
  bias: number;
  weights: number[];
  feature_columns: string[];
  preprocessing: {
    numeric_features: string[];
    numeric_imputer_medians: Record<string, number>;
    numeric_scaler: {
      means: Record<string, number>;
      stds: Record<string, number>;
    };
    categorical_features: string[];
    categorical_one_hot: {
      missing_bucket: string;
      unknown_bucket: string;
    };
    categorical_feature_to_category_to_feature_index: Record<string, Record<string, number>>;
  };
};

const TARGETS: PtmTarget[] = ['diabetes', 'hypertension', 'heart_disease', 'stroke'];

const MODELS: Record<string, PtmModel> = {
  'lifestyle/diabetes': lifestyleDiabetes as PtmModel,
  'lifestyle/hypertension': lifestyleHypertension as PtmModel,
  'lifestyle/heart_disease': lifestyleHeartDisease as PtmModel,
  'lifestyle/stroke': lifestyleStroke as PtmModel,
  'clinical/diabetes': clinicalDiabetes as PtmModel,
  'clinical/hypertension': clinicalHypertension as PtmModel,
  'clinical/heart_disease': clinicalHeartDisease as PtmModel,
  'clinical/stroke': clinicalStroke as PtmModel,
};

function sigmoid(x: number): number {
  const clamped = Math.max(-50, Math.min(50, x));
  return 1 / (1 + Math.exp(-clamped));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPtmInputComplete(input: PtmInputPayload): boolean {
  if (!isFiniteNumber(input.age) || !isFiniteNumber(input.sex)) return false;
  if (!isFiniteNumber(input.race_ethnicity) || !isFiniteNumber(input.education)) return false;
  if (!isFiniteNumber(input.income_poverty_ratio)) return false;
  if (!isFiniteNumber(input.sedentary_minutes)) return false;
  if (!isFiniteNumber(input.vigorous_work)) return false;
  if (!isFiniteNumber(input.calories_day1) || input.calories_day1 < 0) return false;
  return true;
}

function hasClinicData(input: PtmInputPayload): boolean {
  return (
    isFiniteNumber(input.weight_kg)
    && isFiniteNumber(input.height_cm)
    && isFiniteNumber(input.waist_cm)
  );
}

function preprocessAndPredict(model: PtmModel, rawFeatures: Record<string, number | null>): number {
  const { preprocessing, weights, bias, feature_columns } = model;
  const vector = new Array<number>(feature_columns.length).fill(0);

  for (const col of preprocessing.numeric_features) {
    const idx = feature_columns.indexOf(col);
    if (idx === -1) continue;

    let value = rawFeatures[col] ?? null;
    if (value === null || !Number.isFinite(value)) {
      value = preprocessing.numeric_imputer_medians[col] ?? 0;
    }

    const mean = preprocessing.numeric_scaler.means[col] ?? 0;
    const std = preprocessing.numeric_scaler.stds[col] ?? 1;
    vector[idx] = std > 0 ? (value - mean) / std : 0;
  }

  const { categorical_feature_to_category_to_feature_index, categorical_one_hot } = preprocessing;
  for (const col of preprocessing.categorical_features) {
    const rawValue = rawFeatures[col];
    const categoryStr = rawValue !== null && rawValue !== undefined
      ? String(rawValue)
      : categorical_one_hot.missing_bucket;

    const mapping = categorical_feature_to_category_to_feature_index[col];
    if (!mapping) continue;

    const idx = mapping[categoryStr] ?? mapping[categorical_one_hot.unknown_bucket];
    if (idx !== undefined) vector[idx] = 1;
  }

  let logit = bias;
  for (let i = 0; i < weights.length; i++) {
    logit += weights[i] * vector[i];
  }

  return sigmoid(logit);
}

const NUTRITION_KEYS = new Set([
  'calories_day1', 'protein_g_day1', 'carbohydrate_g_day1', 'sugar_g_day1',
  'total_fat_g_day1', 'saturated_fat_g_day1', 'sodium_mg_day1',
  'fiber_g_day1', 'cholesterol_mg_day1', 'alcohol_g_day1',
]);

function toRawMap(input: PtmInputPayload): Record<string, number | null> {
  const map: Record<string, number | null> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) {
      map[key] = null;
      continue;
    }
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n) || (NUTRITION_KEYS.has(key) && n < 0)) {
      map[key] = null;
      continue;
    }
    map[key] = n;
  }
  return map;
}

export function predictPtmRiskLocal(input: PtmInputPayload): PtmRiskResult {
  const featureSet: PtmFeatureSet = hasClinicData(input) ? 'clinical' : 'lifestyle';

  if (!isPtmInputComplete(input)) {
    return emptyPtmRiskResult(featureSet);
  }

  const rawMap = toRawMap(input);

  const risks = TARGETS.map((target) => {
    const model = MODELS[`${featureSet}/${target}`];
    const probability = preprocessAndPredict(model, rawMap);
    return {
      target,
      probability: Math.round(probability * 1000) / 1000,
      isAtRisk: probability >= model.threshold,
      threshold: model.threshold,
    };
  });

  const avg = risks.reduce((sum, item) => sum + item.probability, 0) / risks.length;

  return {
    featureSet,
    overallScore: Math.round(avg * 1000) / 1000,
    overallIsAtRisk: risks.some((item) => item.isAtRisk),
    dataComplete: true,
    risks,
  };
}
