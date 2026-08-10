import {
  ScreeningAnswers,
  ScreeningCheck,
  ScreeningSession,
  ScreeningStatus,
} from '@/types';
import {
  evaluateScreening,
  SCREENING_INSTRUMENT_VERSION,
  SCREENING_QUESTIONS,
} from '@/features/screening/screening-rules';
import { getHealthDatabase } from './health-db';

type ScreeningRow = {
  id: number;
  owner_user_id: number;
  instrument_version: string;
  answers_json: string;
  factors_json: string;
  missing_checks_json: string;
  result_status: ScreeningStatus;
  completed_at: string;
};

const QUESTION_IDS = new Set(SCREENING_QUESTIONS.map((question) => question.id));
const CHECK_IDS = new Set<ScreeningCheck>([
  'blood_pressure', 'blood_glucose', 'cholesterol', 'weight_status',
]);

function parseArray<T extends string>(value: string, allowed: Set<T>): T[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is T => allowed.has(item)) : [];
  } catch {
    return [];
  }
}

function validateAnswers(answers: ScreeningAnswers): ScreeningAnswers {
  if (SCREENING_QUESTIONS.some((question) => !['yes', 'no', 'unknown'].includes(answers[question.id]))) {
    throw new Error('Semua pertanyaan screening wajib dijawab');
  }
  return answers;
}

function toSession(row: ScreeningRow): ScreeningSession {
  let answers: ScreeningAnswers;
  try {
    answers = validateAnswers(JSON.parse(row.answers_json) as ScreeningAnswers);
  } catch {
    throw new Error('Hasil screening lokal tidak valid');
  }
  return {
    id: row.id,
    userId: row.owner_user_id,
    instrumentVersion: row.instrument_version,
    answers,
    factors: parseArray(row.factors_json, QUESTION_IDS),
    missingChecks: parseArray(row.missing_checks_json, CHECK_IDS),
    status: row.result_status,
    completedAt: row.completed_at,
  };
}

export async function saveScreening(
  ownerUserId: number,
  rawAnswers: ScreeningAnswers
): Promise<ScreeningSession> {
  const answers = validateAnswers(rawAnswers);
  const result = evaluateScreening(answers);
  const completedAt = new Date().toISOString();
  const database = await getHealthDatabase();
  const insert = await database.runAsync(
    `INSERT INTO screening_sessions (
      owner_user_id, instrument_version, answers_json, factors_json,
      missing_checks_json, result_status, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ownerUserId,
    SCREENING_INSTRUMENT_VERSION,
    JSON.stringify(answers),
    JSON.stringify(result.factors),
    JSON.stringify(result.missingChecks),
    result.status,
    completedAt
  );
  return {
    id: insert.lastInsertRowId,
    userId: ownerUserId,
    instrumentVersion: SCREENING_INSTRUMENT_VERSION,
    answers,
    ...result,
    completedAt,
  };
}

export async function getLatestScreening(ownerUserId: number): Promise<ScreeningSession | null> {
  const database = await getHealthDatabase();
  const row = await database.getFirstAsync<ScreeningRow>(
    `SELECT id, owner_user_id, instrument_version, answers_json, factors_json,
      missing_checks_json, result_status, completed_at
     FROM screening_sessions WHERE owner_user_id = ? ORDER BY completed_at DESC, id DESC LIMIT 1`,
    ownerUserId
  );
  return row ? toSession(row) : null;
}
