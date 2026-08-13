import { DailyLog, DailyLogType } from '@/types';
import { getHealthDatabase } from './health-db';

const LOG_COLUMNS = `
  id, owner_user_id, type, title, quantity, detail, log_date, time, source, created_at
`;

type DailyLogRow = {
  id: number;
  owner_user_id: number;
  type: DailyLogType;
  title: string;
  quantity: string | null;
  detail: string | null;
  log_date: string;
  time: string;
  source: DailyLog['source'];
  created_at: string;
};

export type CreateDailyLogInput = {
  type: DailyLogType;
  title: string;
  quantity?: string | null;
  detail?: string | null;
  logDate: string;
  time: string;
  source?: DailyLog['source'];
};

const VALID_TYPES = new Set<DailyLogType>(['food', 'medication', 'exercise', 'water']);
const VALID_SOURCES = new Set<DailyLog['source']>(['manual', 'schedule']);

function validateInput(input: CreateDailyLogInput): CreateDailyLogInput {
  const title = input.title.trim();
  const parsedDate = new Date(`${input.logDate}T00:00:00Z`);
  if (!VALID_TYPES.has(input.type)) throw new Error('Jenis catatan tidak valid');
  if (!title) throw new Error('Nama aktivitas wajib diisi');
  if (title.length > 120 || (input.quantity?.length ?? 0) > 80 || (input.detail?.length ?? 0) > 500) {
    throw new Error('Catatan harian terlalu panjang');
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) {
    throw new Error('Waktu harus menggunakan format HH:MM');
  }
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.logDate) ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== input.logDate
  ) {
    throw new Error('Tanggal catatan tidak valid');
  }
  if (input.source && !VALID_SOURCES.has(input.source)) throw new Error('Sumber catatan tidak valid');
  return { ...input, title };
}

function toDailyLog(row: DailyLogRow): DailyLog {
  return {
    id: row.id,
    userId: row.owner_user_id,
    type: row.type,
    title: row.title,
    quantity: row.quantity,
    detail: row.detail,
    logDate: row.log_date,
    time: row.time,
    source: row.source,
    createdAt: row.created_at,
  };
}

export async function listDailyLogs(ownerUserId: number, date: string): Promise<DailyLog[]> {
  const database = await getHealthDatabase();
  const rows = await database.getAllAsync<DailyLogRow>(
    `SELECT ${LOG_COLUMNS} FROM daily_logs
      WHERE owner_user_id = ? AND log_date = ? ORDER BY time DESC, created_at DESC`,
    ownerUserId,
    date
  );
  return rows.map(toDailyLog);
}

async function getDailyLog(ownerUserId: number, id: number): Promise<DailyLog | null> {
  const database = await getHealthDatabase();
  const row = await database.getFirstAsync<DailyLogRow>(
    `SELECT ${LOG_COLUMNS} FROM daily_logs WHERE id = ? AND owner_user_id = ?`,
    id,
    ownerUserId
  );
  return row ? toDailyLog(row) : null;
}

export async function createDailyLog(
  ownerUserId: number,
  rawInput: CreateDailyLogInput
): Promise<DailyLog> {
  const input = validateInput(rawInput);
  const database = await getHealthDatabase();
  const result = await database.runAsync(
    `INSERT INTO daily_logs (
      owner_user_id, type, title, quantity, detail, log_date, time, source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ownerUserId,
    input.type,
    input.title,
    input.quantity?.trim() || null,
    input.detail?.trim() || null,
    input.logDate,
    input.time,
    input.source ?? 'manual',
    new Date().toISOString()
  );
  const log = await getDailyLog(ownerUserId, result.lastInsertRowId);
  if (!log) throw new Error('Catatan harian gagal disimpan');
  return log;
}

export async function deleteDailyLog(ownerUserId: number, id: number): Promise<boolean> {
  const database = await getHealthDatabase();
  const result = await database.runAsync(
    'DELETE FROM daily_logs WHERE id = ? AND owner_user_id = ?',
    id,
    ownerUserId
  );
  return result.changes === 1;
}
